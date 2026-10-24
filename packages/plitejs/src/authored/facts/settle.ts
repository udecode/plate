import { createInternalDocumentChange } from '../../core/change/document-change';
import {
  type DocumentIndex,
  type NodeList,
  rootNodesOf,
} from '../../core/change/document-index';
import { jsonEqual } from '../../core/change/json';
import {
  RootChange,
  type RootChangeSection,
} from '../../core/change/root-change';
import {
  type JsonEditorValue,
  type JsonNode,
  PreparedTokenSlice,
} from '../../core/change/tokens';
import {
  elementSplitOutput,
  isLeftOutDefault,
} from '../../core/default-storage';
import { canonicalizeCompiledTextProperties } from '../../core/editor-schema';
import { composeRecordOps, deriveValue } from '../../core/record-store';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
import { rootOf } from '../ledger/roots';
import { countLedgerWork } from '../ledger/work';
import { heldProps, textContextAt } from '../tree/holds';
import {
  decideKey,
  type FormatTag,
  type KeyReading,
  keyTips,
  type LayerValue,
  tipsWrittenValue,
  valueAfterLeaving,
} from '../tree/layers';
import {
  type AuthoredMember,
  deletionOf,
  heldOf,
  isClaim,
  readAuthoredMarks,
  readMembers,
  withMembers,
} from '../tree/marks';
import { createDependencies, type Dependencies } from './dependencies';
import { isEditingChange } from './editing';
import { claimsOf, isAccepted, outcomeOf, type ReviewFacts } from './facts';
import {
  incarnationOf,
  type LandedRecord,
  landedOf,
  putContexts,
  putLanded,
} from './records';

type Node = Readonly<Record<string, unknown>> & {
  children?: readonly Node[];
  text?: string;
};

const isText = (node: Node) => typeof node.text === 'string';

export type SettleScope = 'document' | ReadonlyMap<string, ReadonlySet<number>>;

type Pass = Readonly<{
  /** Writes what a node's insertions rest on once some of them are accepted. */
  dependencies: Dependencies;
  facts: ReviewFacts;
  landed: Map<string, LandedRecord>;
  loading: boolean;
  reopenedRejections: Set<string>;
  returnsHeld: boolean;
  schema: CompiledEditorSchema;
}>;

type Site = Readonly<{
  outer: Site | null;
  parent: Node | null;
  root: string;
}>;

const typeOf = (node: Node | null) =>
  typeof node?.type === 'string' ? node.type : null;

const placed = (node: Node, pass: Pass, site: Site) => {
  const outerTypes: string[] = [];

  for (let at = site.outer; at?.parent; at = at.outer) {
    const type = typeOf(at.parent);

    if (type) outerTypes.push(type);
  }

  const place = {
    outerTypes,
    parentType: typeOf(site.parent),
    root: site.root,
  };
  const held = heldProps(pass.schema, node, { ...place, text: isText(node) });

  return isText(held)
    ? canonicalizeCompiledTextProperties(
        pass.schema,
        held,
        textContextAt(place)
      )
    : held;
};

export const keyReadingOf = (
  facts: ReviewFacts,
  schema: CompiledEditorSchema
): KeyReading => ({
  accepted: (member) => isAccepted(facts, member),
  landed: facts.landed,
  outcome: (tag) => (outcomeOf(facts, tag) === 'reject' ? 'reject' : 'keep'),
  output: elementSplitOutput(schema),
});

const settleFormats = (
  node: Node,
  tags: readonly FormatTag[],
  { facts, landed, loading, schema }: Pass
) => {
  const reading = keyReadingOf(facts, schema);
  const dropped = new Set<FormatTag>();
  const props: Record<string, unknown> = {};

  for (const key of new Set(tags.map((tag) => tag.key))) {
    const onKey = tags.filter((tag) => tag.key === key);

    if (
      onKey.every(
        (tag) => !reading.accepted(tag) && reading.outcome(tag) === 'keep'
      )
    ) {
      const value =
        node[key] === undefined ? tipsWrittenValue(onKey) : undefined;

      if (value === undefined) continue;
      const present = new Set(onKey.map((tag) => tag.id));
      const strippedByOlderEditor =
        loading &&
        keyTips(onKey).length === 1 &&
        isLeftOutDefault(schema, node, key, value);
      const overNamesLostWrite = onKey.some((tag) =>
        tag.over?.some((step) => step.some(({ id }) => !present.has(id)))
      );

      if (strippedByOlderEditor || overNamesLostWrite) props[key] = value;
      continue;
    }

    const decision = decideKey(onKey, reading, node[key] as LayerValue);

    if (decision.waits.length > 0) continue;
    for (const tag of decision.landed) {
      if (!facts.landed(tag.id)) landed.set(tag.id, landedOf(tag));
    }
    for (const tag of onKey) {
      if (!decision.kept.includes(tag)) dropped.add(tag);
    }
    if (decision.value.kind === 'set') props[key] = decision.value.value;
  }

  return { dropped, props };
};

const settleNode = (node: Node, pass: Pass, site: Site): Node | null => {
  countLedgerWork('settledNodes');

  const members = readMembers(node);

  if (members.length === 0) return node;

  const { facts } = pass;
  const { dropped, props } = settleFormats(
    node,
    readAuthoredMarks(node).filter(
      (mark): mark is FormatTag => mark.kind === 'format'
    ),
    pass
  );
  const written: Record<string, unknown> = { ...node };
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) delete written[key];
    else written[key] = value;
  }
  const wrote = Object.keys(props).length > 0;
  const next = wrote ? placed(written, pass, site) : written;
  const rewritten =
    wrote &&
    [...Object.keys(props), ...Object.keys(written)].some(
      (key) => !jsonEqual(next[key], node[key])
    );

  if (!facts.hasVerdicts) {
    if (dropped.size === 0) return rewritten ? next : node;

    return withMembers(
      next,
      members.filter(
        (member) => member.kind !== 'format' || !dropped.has(member)
      )
    );
  }
  let changed = dropped.size > 0 || rewritten;
  const kept: AuthoredMember[] = [];
  // Editing's claim that its block goes with a pending join stays until the
  // resolver lands that join.
  const follows = (member: AuthoredMember) =>
    member.kind === 'insert' &&
    isEditingChange(member.change) &&
    member.follows !== undefined;
  // An accepted insertion leaves the node, whether it is a claim or a member
  // of the context the node rests on.
  const inserts = claimsOf(node, facts).filter(
    (mark) => mark.kind === 'insert' && !follows(mark)
  );
  const pendingInserts = inserts.filter(
    (mark) => outcomeOf(facts, mark) !== 'accept'
  );
  const insertsSettled = pendingInserts.length < inserts.length;

  for (const member of members) {
    if (member.kind === 'format' && dropped.has(member)) continue;
    if (follows(member)) {
      kept.push(member);
      continue;
    }
    if (member.kind === 'in' || member.kind === 'insert') {
      if (!insertsSettled) kept.push(member);
      continue;
    }
    if (member.kind === 'held' && !pass.returnsHeld) {
      kept.push(member);
      continue;
    }

    const claim = member.kind === 'held' ? deletionOf(member) : member;
    const outcome = outcomeOf(facts, claim);

    if (claim.kind === 'delete') {
      if (outcome === 'accept' && isText(node)) return null;
      if (outcome === 'reject') {
        kept.push(member.kind === 'held' ? member : heldOf(claim));
        if (member.kind !== 'held') changed = true;
        continue;
      }
      if (facts.hasVerdict(incarnationOf(claim), 'reject')) {
        pass.reopenedRejections.add(incarnationOf(claim));
      }
      if (member.kind === 'held') changed = true;
      kept.push(claim);
      continue;
    }
    kept.push(claim);
  }

  if (!changed && !insertsSettled) return node;

  return insertsSettled
    ? pass.dependencies.props(withMembers(next, kept), [
        ...kept.filter(isClaim),
        ...pendingInserts,
      ])
    : withMembers(next, kept);
};

/**
 * As the resolver's survival rule does, an inline element whose own deletion
 * is accepted goes once none of its settled children is content.
 */
const goesWhenSettled = (
  element: Node,
  children: readonly Node[],
  facts: ReviewFacts
) =>
  readAuthoredMarks(element).some(
    (mark) => mark.kind === 'delete' && outcomeOf(facts, mark) === 'accept'
  ) && children.every((child) => isText(child) && child.text === '');

const settleNodes = <L extends NodeList<Node>>(
  nodes: L,
  pass: Pass,
  site: Site,
  inline = false
): L | Node[] => {
  let changed = false;
  let holdsText = false;
  const next: Node[] = [];

  nodes.forEach((node) => {
    holdsText ||= isText(node);

    const settled = settleNode(node, pass, site);

    if (!settled) {
      changed = true;

      return;
    }

    const children =
      settled.children &&
      settleNodes(
        settled.children,
        pass,
        { outer: site, parent: settled, root: site.root },
        settled.children.some(isText)
      );

    if (inline && children && goesWhenSettled(settled, children, pass.facts)) {
      changed = true;

      return;
    }

    const result =
      children && children !== settled.children
        ? { ...settled, children }
        : settled;

    if (result !== node) changed = true;
    next.push(result);
  });

  if (!changed) return nodes;
  if (next.length === 0 && holdsText) return [{ text: '' }];

  return next;
};

/**
 * The blocks of `index` at `blocks` that settle to another node, as one change
 * of the root, so a settled block costs its own range and not the root.
 */
const settleBlocks = (
  index: DocumentIndex,
  pass: Pass,
  blocks: ReadonlySet<number>,
  root: string
) => {
  const sections: RootChangeSection[] = [];

  for (const at of [...blocks].sort((left, right) => left - right)) {
    const block = index.child(at) as Node | undefined;

    if (!block) continue;

    const settled = settleNodes([block], pass, {
      outer: null,
      parent: null,
      root,
    })[0];

    if (settled !== block) {
      sections.push({
        from: index.childPosition([], at),
        insert: PreparedTokenSlice.fromNodes([settled as JsonNode]),
        to: index.childPosition([], at + 1),
      });
    }
  }

  return sections.length === 0 ? null : RootChange.create(index, sections);
};

const formatTagsOf = (node: Node) =>
  readAuthoredMarks(node).filter(
    (mark): mark is FormatTag => mark.kind === 'format'
  );

const sameValue = (left: unknown, right: unknown) =>
  left === undefined || left === null
    ? right === undefined || right === null
    : jsonEqual(left, right);

export const repairKeys = (
  before: Node,
  after: Node,
  reading: KeyReading
): Node => {
  const was = formatTagsOf(before);
  const now = formatTagsOf(after);
  let next: Record<string, unknown> | null = null;

  for (const key of new Set(was.map((tag) => tag.key))) {
    const wasOnKey = was.filter((tag) => tag.key === key);
    const nowOnKey = now.filter((tag) => tag.key === key);
    const wasIds = new Set(wasOnKey.map(({ id }) => id));
    const nowIds = new Set(nowOnKey.map(({ id }) => id));
    const left = new Set(wasOnKey.filter(({ id }) => !nowIds.has(id)));

    if (
      left.size === 0 ||
      nowOnKey.some(({ id }) => !wasIds.has(id)) ||
      sameValue(before[key], after[key])
    ) {
      continue;
    }

    const decided = valueAfterLeaving(
      wasOnKey,
      left,
      reading,
      before[key] as LayerValue
    );

    if (!decided) continue;

    const value = decided.kind === 'set' ? decided.value : before[key];

    if (sameValue(value, after[key])) continue;
    next ??= { ...after };
    if (value === undefined || value === null) delete next[key];
    else next[key] = value;
  }

  return next ?? after;
};

/**
 * Returning a held deletion asks which changes still insert, which `facts`
 * answers by walking the whole document unless an index backs it, so a block
 * scope returns held deletions only with `returnsHeld`.
 */
export const settleValue = <V extends JsonEditorValue>(
  value: V,
  facts: ReviewFacts,
  scope: SettleScope,
  {
    returnsHeld = scope === 'document',
    restoreMissingFormats = scope === 'document',
    schema,
  }: Readonly<{
    returnsHeld?: boolean;
    restoreMissingFormats?: boolean;
    schema: CompiledEditorSchema;
  }>
): Readonly<{ reopenedRejections: ReadonlySet<string>; value: V | null }> => {
  const pass: Pass = {
    dependencies: createDependencies(facts),
    facts,
    landed: new Map(),
    loading: scope === 'document',
    reopenedRejections: new Set(),
    returnsHeld,
    schema,
  };

  if (!facts.hasVerdicts && !restoreMissingFormats) {
    return { reopenedRejections: pass.reopenedRejections, value: null };
  }

  const settled =
    scope === 'document'
      ? settleRoots(value, pass)
      : settleScope(value, pass, scope);
  const minted = pass.dependencies.minted();

  return {
    reopenedRejections: pass.reopenedRejections,
    value:
      settled === value && minted.length === 0
        ? null
        : deriveValue(
            settled,
            {},
            composeRecordOps(
              putContexts(minted),
              putLanded(pass.landed.values())
            )
          ),
  };
};

const settleScope = <V extends JsonEditorValue>(
  value: V,
  pass: Pass,
  scope: ReadonlyMap<string, ReadonlySet<number>>
): V => {
  const changes = new Map<string, RootChange>();

  for (const [root, blocks] of scope) {
    const change = settleBlocks(rootOf(value, root), pass, blocks, root);

    if (change) changes.set(root, change);
  }

  return changes.size === 0
    ? value
    : createInternalDocumentChange(changes).apply(value);
};

const settleRoots = <V extends JsonEditorValue>(value: V, pass: Pass): V => {
  const settleIn = (root: string, nodes: NodeList<Node>) =>
    settleNodes(nodes, pass, { outer: null, parent: null, root });
  const main = rootNodesOf(
    value as Readonly<{ children: readonly Node[] }>,
    'children'
  );
  const children = settleIn('main', main);
  const roots = Object.entries(value.roots ?? {}).map(
    ([root, nodes]) =>
      [root, nodes, settleIn(root, nodes as readonly Node[])] as const
  );
  const rootsChanged = roots.some(([, nodes, settled]) => settled !== nodes);

  return children === main && !rootsChanged
    ? value
    : deriveValue(value, {
        ...(children === main ? {} : { children }),
        ...(rootsChanged
          ? {
              roots: Object.fromEntries(
                roots.map(([root, , settled]) => [root, settled])
              ),
            }
          : {}),
      } as Partial<V>);
};
