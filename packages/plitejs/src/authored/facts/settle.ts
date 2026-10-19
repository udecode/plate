import { type NodeList, rootNodesOf } from '../../core/change/document-index';
import { jsonEqual } from '../../core/change/json';
import { composeRecordOps, deriveValue } from '../../core/record-store';
import { countLedgerWork } from '../ledger/work';
import {
  decideKey,
  type FormatTag,
  type KeyReading,
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

type Value = Readonly<{
  children: readonly unknown[];
  roots?: Readonly<Record<string, readonly unknown[]>>;
}>;

const isText = (node: Node) => typeof node.text === 'string';

export type SettleScope = 'document' | ReadonlyMap<string, ReadonlySet<number>>;

type Pass = Readonly<{
  /** Writes what a node's insertions rest on once some of them are accepted. */
  dependencies: Dependencies;
  facts: ReviewFacts;
  landed: Map<string, LandedRecord>;
  reopenedRejections: Set<string>;
  returnsHeld: boolean;
}>;

export const keyReadingOf = (facts: ReviewFacts): KeyReading => ({
  accepted: (member) => isAccepted(facts, member),
  landed: facts.landed,
  outcome: (tag) => (outcomeOf(facts, tag) === 'reject' ? 'reject' : 'keep'),
});

const settleFormats = (
  node: Node,
  tags: readonly FormatTag[],
  facts: ReviewFacts,
  landed: Map<string, LandedRecord>
) => {
  const reading = keyReadingOf(facts);
  const dropped = new Set<FormatTag>();
  const props: Record<string, unknown> = {};

  for (const key of new Set(tags.map((tag) => tag.key))) {
    const onKey = tags.filter((tag) => tag.key === key);

    if (
      onKey.every(
        (tag) => !reading.accepted(tag) && reading.outcome(tag) === 'keep'
      )
    ) {
      const present = new Set(onKey.map((tag) => tag.id));
      if (
        node[key] === undefined &&
        onKey.some((tag) =>
          tag.over?.some((step) => step.some(({ id }) => !present.has(id)))
        )
      ) {
        const value = tipsWrittenValue(onKey);
        if (value !== undefined) props[key] = value;
      }
      continue;
    }

    const decision = decideKey(onKey, reading);

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

const settleNode = (node: Node, pass: Pass): Node | null => {
  countLedgerWork('settledNodes');

  const members = readMembers(node);

  if (members.length === 0) return node;

  const { facts } = pass;
  const { dropped, props } = settleFormats(
    node,
    readAuthoredMarks(node).filter(
      (mark): mark is FormatTag => mark.kind === 'format'
    ),
    facts,
    pass.landed
  );
  const next: Record<string, unknown> = { ...node };
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) delete next[key];
    else next[key] = value;
  }
  if (!facts.hasVerdicts) {
    if (dropped.size === 0) {
      return Object.keys(props).length > 0 ? next : node;
    }

    return withMembers(
      next,
      members.filter(
        (member) => member.kind !== 'format' || !dropped.has(member)
      )
    );
  }
  let changed = dropped.size > 0 || Object.keys(props).length > 0;
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
  inline = false
): L | Node[] => {
  let changed = false;
  let holdsText = false;
  const next: Node[] = [];

  nodes.forEach((node) => {
    holdsText ||= isText(node);

    const settled = settleNode(node, pass);

    if (!settled) {
      changed = true;

      return;
    }

    const children =
      settled.children &&
      settleNodes(settled.children, pass, settled.children.some(isText));

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

const settleBlocks = (
  children: NodeList<Node>,
  pass: Pass,
  blocks: ReadonlySet<number> | undefined
) => {
  if (!blocks) return children;

  let next: Node[] | null = null;

  for (const index of blocks) {
    const block = children.at(index);

    if (!block) continue;

    const settled = settleNodes([block], pass)[0];

    if (settled !== block) {
      next ??= children.slice();
      next[index] = settled;
    }
  }

  return next ?? children;
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

    const decided = valueAfterLeaving(wasOnKey, left, reading);

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
export const settleValue = <V extends Value>(
  value: V,
  facts: ReviewFacts,
  scope: SettleScope,
  {
    returnsHeld = scope === 'document',
    restoreMissingFormats = scope === 'document',
  }: Readonly<{ returnsHeld?: boolean; restoreMissingFormats?: boolean }> = {}
): Readonly<{ reopenedRejections: ReadonlySet<string>; value: V | null }> => {
  const pass: Pass = {
    dependencies: createDependencies(facts),
    facts,
    landed: new Map(),
    reopenedRejections: new Set(),
    returnsHeld,
  };

  if (!facts.hasVerdicts && !restoreMissingFormats) {
    return { reopenedRejections: pass.reopenedRejections, value: null };
  }

  const settleIn = (root: string, nodes: NodeList<Node>) =>
    scope === 'document'
      ? settleNodes(nodes, pass)
      : settleBlocks(nodes, pass, scope.get(root));
  const main = rootNodesOf(
    value as Readonly<{ children: readonly Node[] }>,
    'children'
  );
  const children = settleIn('main', main);
  const roots = Object.entries(value.roots ?? {}).map(
    ([root, nodes]) =>
      [root, nodes, settleIn(root, nodes as readonly Node[])] as const
  );
  const minted = pass.dependencies.minted();
  const rootsChanged = roots.some(([, nodes, settled]) => settled !== nodes);

  return {
    reopenedRejections: pass.reopenedRejections,
    value:
      children === main && !rootsChanged && minted.length === 0
        ? null
        : deriveValue(
            value,
            {
              ...(children === main ? {} : { children }),
              ...(rootsChanged
                ? {
                    roots: Object.fromEntries(
                      roots.map(([root, , settled]) => [root, settled])
                    ),
                  }
                : {}),
            } as Partial<V>,
            composeRecordOps(
              putContexts(minted),
              putLanded(pass.landed.values())
            )
          ),
  };
};
