import {
  createInternalDocumentChange,
  type DocumentChange,
} from '../../core/change/document-change';
import {
  DocumentIndex,
  type NodeList,
  rootNodesOf,
} from '../../core/change/document-index';
import { jsonEqual } from '../../core/change/json';
import { retractionOf } from '../../core/change/retraction';
import {
  propertyDeltaFromModifications,
  RootChange,
  type RootChangeSection,
  semanticPropertyModifications,
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
import {
  canonicalizeCompiledTextProperties,
  readEmptyText,
} from '../../core/editor-schema';
import { composeRecordOps, deriveValue } from '../../core/record-store';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
import { survivalUnder } from '../../core/survival';
import type { Path } from '../../interfaces/path';
import { getDefined } from '../../internal/get-defined';
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
  isAuthoredSetValued,
  isClaim,
  isPlaceChange,
  isStructureChange,
  readAuthoredMarks,
  readMembers,
  withMembers,
} from '../tree/marks';
import {
  type AuthoredResolveSchema,
  slotDecidingInsertions,
  startOccupants,
  vacatesSlot,
} from '../tree/resolve';
import { createDependencies, type Dependencies } from './dependencies';
import { isEditingChange } from './editing';
import {
  claimsOf,
  isAccepted,
  outcomeOf,
  type ReviewFacts,
  standingClaimsOf,
} from './facts';
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

type RootEdits = Readonly<{
  change: () => RootChange | null;
  donate: (path: Path, read: Node, built: Node) => void;
  drop: (path: Path) => void;
  props: (path: Path, was: Node, now: Node) => void;
  refill: (path: Path) => void;
}>;

type Pass = Readonly<{
  /** Writes what a node's insertions rest on once some of them are accepted. */
  dependencies: Dependencies;
  edits: Map<string, RootEdits>;
  facts: ReviewFacts;
  gone: WeakSet<Node>;
  indexOf: (root: string) => DocumentIndex;
  landed: Map<string, LandedRecord>;
  loading: boolean;
  reopenedRejections: Set<string>;
  resolveSchema: () => AuthoredResolveSchema;
  returnsHeld: boolean;
  schema: CompiledEditorSchema;
}>;

type Site = Readonly<{
  outer: Site | null;
  parent: Node | null;
  parentPath: Path;
  root: string;
}>;

type Level = Readonly<{ nodes: readonly Node[]; readIndex: readonly number[] }>;

const propsOf = ({ children: _children, text: _text, ...props }: Node) => props;

const propertySection = (
  index: () => DocumentIndex,
  path: Path,
  was: Node,
  now: Node
): RootChangeSection | null => {
  const modifications = semanticPropertyModifications(
    propsOf(was),
    propsOf(now),
    (key) => isAuthoredSetValued(null, key)
  );

  if (modifications.length === 0) return null;

  const { from } = index().nodeRange(path);

  return {
    from,
    properties: propertyDeltaFromModifications(modifications),
    to: from + 1,
  };
};

const donation = (
  index: DocumentIndex,
  path: Path,
  read: Node,
  built: Node
): RootChangeSection[] => {
  const props = propertySection(() => index, path, read, built);
  const content = {
    from: index.childPosition(path, 0),
    insert: PreparedTokenSlice.fromNodes(
      (built.children ?? []) as readonly JsonNode[]
    ),
    to: index.childPosition(path, read.children?.length ?? 0),
  };

  return props ? [props, content] : [content];
};

const createRootEdits = (indexOf: () => DocumentIndex): RootEdits => {
  let index: DocumentIndex | undefined;
  let sections: RootChangeSection[] = [];
  const read = () => (index ??= indexOf());
  const supersede = (
    from: number,
    to: number,
    added: readonly RootChangeSection[]
  ) => {
    sections = sections.filter(
      (section) => section.from < from || section.from >= to
    );
    sections.push(...added);
  };

  return {
    change: () =>
      sections.length === 0 ? null : RootChange.create(read(), sections),
    donate: (path, was, built) => {
      const { from, to } = read().nodeRange(path);

      supersede(from, to, donation(read(), path, was, built));
    },
    drop: (path) => {
      const { from, to } = read().nodeRange(path);

      supersede(from, to, [{ from, to }]);
    },
    props: (path, was, now) => {
      const section = propertySection(read, path, was, now);

      if (section) sections.push(section);
    },
    refill: (path) => {
      const from = read().childPosition(path, 0);
      const to = read().childPosition(
        path,
        read().node(path).children?.length ?? 0
      );

      supersede(from, to, [
        { from, insert: PreparedTokenSlice.fromNodes([{ text: '' }]), to },
      ]);
    },
  };
};

const editsOf = (pass: Pass, root: string) => {
  let edits = pass.edits.get(root);

  if (!edits) {
    edits = createRootEdits(() => pass.indexOf(root));
    pass.edits.set(root, edits);
  }

  return edits;
};

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

const goesWhenSettled = (
  element: Node,
  children: readonly Node[],
  pass: Pass
) =>
  readAuthoredMarks(element).some(
    (mark) => mark.kind === 'delete' && outcomeOf(pass.facts, mark) === 'accept'
  ) &&
  children.every(
    (child) => pass.gone.has(child) || (isText(child) && child.text === '')
  );

const dropDeletionWhenContentStays = (
  element: Node,
  children: readonly Node[],
  pass: Pass
) => {
  const members = readMembers(element);
  const live = members.filter(
    (member) =>
      member.kind !== 'delete' || outcomeOf(pass.facts, member) !== 'accept'
  );

  if (live.length === members.length) return element;

  const { liveContent } = survivalUnder<Node>(
    (node) =>
      pass.gone.has(node) ||
      pendingOn(
        node,
        pass.facts,
        (mark) => mark.kind === 'insert' || mark.kind === 'delete'
      )
  );

  return children.some(liveContent) ? withMembers(element, live) : element;
};

const chainOf = (site: Site) => {
  const chain: Node[] = [];

  for (let at: Site | null = site; at?.parent; at = at.outer) {
    chain.push(at.parent);
  }

  return chain;
};

const pendingOn = (
  node: Node,
  facts: ReviewFacts,
  test: (mark: ReturnType<typeof claimsOf>[number]) => boolean
) =>
  claimsOf(node, facts).some(
    (mark) => outcomeOf(facts, mark) === 'pending' && test(mark)
  );

const buildWaits = (
  chain: readonly Node[],
  left: readonly Node[],
  facts: ReviewFacts
) =>
  chain.some((node, at) =>
    pendingOn(
      node,
      facts,
      (mark) =>
        mark.kind === 'insert' ||
        isStructureChange(mark) ||
        (at === 0 && (isPlaceChange(mark) || mark.kind === 'delete'))
    )
  ) || left.some((node) => pendingOn(node, facts, isStructureChange));

const donationRetracts = (read: Node, built: Node, site: Site, pass: Pass) => {
  if (isText(read) || isText(built)) return false;

  const index = DocumentIndex.fromValue([read as JsonNode]);
  const outer = chainOf(site);

  return (
    retractionOf(
      index,
      RootChange.create(index, donation(index, [0], read, built)),
      (ancestors) =>
        readEmptyText(pass.schema, [...ancestors, ...outer], site.root)
    ) !== null
  );
};

const replacementsOf = (
  size: number,
  removed: readonly number[],
  childAt: (at: number) => Node,
  readAt: (at: number) => Node,
  site: Site,
  pass: Pass
): ReadonlyMap<number, readonly Node[]> | null => {
  const chain = chainOf(site);
  const schema = pass.resolveSchema();
  const content = schema.content(typeOf(chain[0] ?? null), site.root);

  if (
    content &&
    getDefined(removed[0]) >= content.prefix &&
    size - removed.length >= content.min
  ) {
    return new Map(removed.map((at) => [at, []]));
  }

  const { complete } = schema;

  if (!complete) return null;

  const gone = new Set(removed);
  const level = Array.from({ length: size }, (_, at) => childAt(at));
  const left = level.filter((_, at) => !gone.has(at));
  const origins = new Map(level.map((node, at) => [node, readAt(at)]));
  const origin = (node: unknown) => origins.get(node as Node) ?? (node as Node);
  const inserted = (node: unknown) =>
    standingClaimsOf(origin(node), pass.facts, pass.facts).some(
      (mark) => mark.kind === 'insert'
    );
  const start = startOccupants(level.map(origin), inserted);
  const completeHere = (nodes: readonly Node[]) =>
    complete(
      nodes as readonly JsonNode[],
      chain,
      site.root,
      (slot, candidate) => vacatesSlot(start, slot, origin(candidate), inserted)
    );
  const completion = completeHere(left);
  const slots = content?.prefix ?? 0;

  if (
    (completion.built.length > 0 && buildWaits(chain, left, pass.facts)) ||
    (slots > 0 &&
      slotDecidingInsertions(
        left as readonly JsonNode[],
        completion,
        completeHere,
        slots,
        (node) => start.includes(origin(node)),
        inserted
      ).some((node) =>
        pendingOn(origin(node), pass.facts, (mark) => mark.kind === 'insert')
      ))
  ) {
    return null;
  }

  const children = completion.children as readonly Node[];
  const into = new Map<number, Node[]>(removed.map((at) => [at, []]));
  let gap: number[] = [];
  let filled = 0;
  let next = 0;
  const place = (node: Node | undefined) => {
    const at = gap[filled];

    if (!node || at === undefined) return false;
    getDefined(into.get(at)).push(node);
    filled += 1;
    next += 1;

    return true;
  };

  for (const [at, node] of level.entries()) {
    if (gone.has(at)) {
      gap.push(at);
      continue;
    }
    while (children[next] !== node) {
      if (!place(children[next])) return null;
    }
    next += 1;
    gap = [];
    filled = 0;
  }
  while (next < children.length) {
    if (!place(children[next])) return null;
  }

  return [...into].every(
    ([at, [built]]) => !built || donationRetracts(readAt(at), built, site, pass)
  )
    ? into
    : null;
};

const leaveLevel = (
  level: Level,
  stored: NodeList<Node>,
  site: Site,
  pass: Pass
): NodeList<Node> | readonly Node[] => {
  const { nodes, readIndex } = level;
  const removed = nodes.flatMap((node, at) =>
    pass.gone.has(node) ? [at] : []
  );

  if (removed.length === 0) return nodes;

  const readAt = (at: number) =>
    getDefined(stored.at(getDefined(readIndex[at])));
  const into = replacementsOf(
    nodes.length,
    removed,
    (at) => getDefined(nodes[at]),
    readAt,
    site,
    pass
  );

  if (into === null) {
    return nodes.length === stored.length &&
      nodes.every((node, at) => node === stored.at(at))
      ? stored
      : nodes;
  }

  const edits = editsOf(pass, site.root);

  for (const [at, [built]] of into) {
    const path = [...site.parentPath, getDefined(readIndex[at])];

    if (built) edits.donate(path, readAt(at), built);
    else edits.drop(path);
  }

  return nodes.flatMap((node, at) => into.get(at) ?? [node]);
};

const settleChild = (
  node: Node,
  at: number,
  pass: Pass,
  site: Site,
  inline: boolean
): Node | null => {
  const path = [...site.parentPath, at];
  const edits = editsOf(pass, site.root);
  const settled = settleNode(node, pass, site);

  if (!settled) {
    edits.drop(path);

    return null;
  }
  if (!settled.children) {
    if (settled !== node) edits.props(path, node, settled);

    return settled;
  }

  const inner: Site = {
    outer: site,
    parent: settled,
    parentPath: path,
    root: site.root,
  };
  const level = settleNodes(
    settled.children,
    pass,
    inner,
    settled.children.some(isText)
  );

  if (goesWhenSettled(settled, level?.nodes ?? settled.children, pass)) {
    if (inline) {
      edits.drop(path);

      return null;
    }
    if (settled !== node) edits.props(path, node, settled);

    const shell = level ? { ...settled, children: level.nodes } : settled;

    pass.gone.add(shell);

    return shell;
  }

  const kept = dropDeletionWhenContentStays(
    settled,
    level?.nodes ?? settled.children,
    pass
  );

  if (kept !== node) edits.props(path, node, kept);

  const left = level
    ? leaveLevel(level, settled.children, inner, pass)
    : settled.children;

  return left === settled.children
    ? kept
    : { ...kept, children: left as readonly Node[] };
};

const settleNodes = (
  nodes: NodeList<Node>,
  pass: Pass,
  site: Site,
  inline = false
): Level | null => {
  let changed = false;
  let firstText = -1;
  const readIndex: number[] = [];
  const next: Node[] = [];

  nodes.forEach((node, at) => {
    if (firstText === -1 && isText(node)) firstText = at;

    const settled = settleChild(node, at, pass, site, inline);

    if (settled !== node || (settled && pass.gone.has(settled))) {
      changed = true;
    }
    if (!settled) return;
    readIndex.push(at);
    next.push(settled);
  });

  if (!changed) return null;
  if (next.length === 0 && firstText !== -1) {
    editsOf(pass, site.root).refill(site.parentPath);

    return { nodes: [{ text: '' }], readIndex: [firstText] };
  }

  return { nodes: next, readIndex };
};

const settleBlocks = (
  index: DocumentIndex,
  pass: Pass,
  blocks: ReadonlySet<number>,
  root: string
) => {
  const site: Site = { outer: null, parent: null, parentPath: [], root };
  const settled = new Map<number, Node>();

  for (const at of [...blocks].sort((left, right) => left - right)) {
    const block = index.child(at) as Node | undefined;

    if (block) {
      settled.set(at, getDefined(settleChild(block, at, pass, site, false)));
    }
  }

  const removed = [...settled].flatMap(([at, node]) =>
    pass.gone.has(node) ? [at] : []
  );
  const readAt = (at: number) => index.child(at) as Node;
  const into =
    removed.length === 0
      ? null
      : replacementsOf(
          index.size,
          removed,
          (at) => settled.get(at) ?? readAt(at),
          readAt,
          site,
          pass
        );

  for (const [at, [built]] of into ?? []) {
    if (built) editsOf(pass, root).donate([at], readAt(at), built);
    else editsOf(pass, root).drop([at]);
  }
};

const settleRoot = (nodes: NodeList<Node>, pass: Pass, root: string) => {
  const site: Site = { outer: null, parent: null, parentPath: [], root };
  const level = settleNodes(nodes, pass, site);

  if (level) leaveLevel(level, nodes, site, pass);
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
    resolveSchema,
    schema,
  }: Readonly<{
    returnsHeld?: boolean;
    restoreMissingFormats?: boolean;
    resolveSchema: () => AuthoredResolveSchema;
    schema: CompiledEditorSchema;
  }>
): Readonly<{
  change: DocumentChange | null;
  reopenedRejections: ReadonlySet<string>;
  value: V | null;
}> => {
  let resolve: AuthoredResolveSchema | undefined;
  const pass: Pass = {
    dependencies: createDependencies(facts),
    edits: new Map(),
    facts,
    gone: new WeakSet(),
    indexOf: (root) => rootOf(value, root),
    landed: new Map(),
    loading: scope === 'document',
    reopenedRejections: new Set(),
    resolveSchema: () => (resolve ??= resolveSchema()),
    returnsHeld,
    schema,
  };

  if (!facts.hasVerdicts && !restoreMissingFormats) {
    return {
      change: null,
      reopenedRejections: pass.reopenedRejections,
      value: null,
    };
  }

  if (scope === 'document') {
    settleRoot(rootNodesOf(value, 'children'), pass, 'main');
    for (const [root, nodes] of Object.entries(value.roots ?? {})) {
      settleRoot(nodes, pass, root);
    }
  } else {
    for (const [root, blocks] of scope) {
      settleBlocks(rootOf(value, root), pass, blocks, root);
    }
  }

  const changes = new Map(
    [...pass.edits].flatMap(([root, edits]) => {
      const change = edits.change();

      return change ? [[root, change] as const] : [];
    })
  );
  const change =
    changes.size === 0 ? null : createInternalDocumentChange(changes);
  const minted = pass.dependencies.minted();

  return {
    change,
    reopenedRejections: pass.reopenedRejections,
    value:
      !change && minted.length === 0
        ? null
        : deriveValue(
            change ? change.apply(value) : value,
            {},
            composeRecordOps(
              putContexts(minted),
              putLanded(pass.landed.values())
            )
          ),
  };
};
