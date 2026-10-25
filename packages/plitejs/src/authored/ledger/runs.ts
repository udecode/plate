import {
  DocumentChange,
  getInternalDocumentRootChange,
} from '../../core/change/document-change';
import { DocumentIndex } from '../../core/change/document-index';
import { deepFreeze, jsonEqual } from '../../core/change/json';
import {
  addSection,
  type DocumentSetPropertyResolver,
  RootChange,
  type SectionData,
} from '../../core/change/root-change';
import {
  type JsonEditorValue,
  type JsonNode,
  PreparedTokenSlice,
} from '../../core/change/tokens';
import type { RecordSetVersion } from '../../core/record-store';
import type { ListPart } from '../../core/representation';
import { survivalUnder } from '../../core/survival';
import { getDefined } from '../../internal/get-defined';
import type { ReviewFacts } from '../facts/facts';
import { incarnationOf } from '../facts/records';
import type { AuthoredFormatProjection } from '../format';
import {
  acceptedAlignment,
  decidedAlignment,
  diffedAcceptedChange,
  NOTHING_UNSTORED,
  type Settled,
  settledChange,
  tokenLength,
} from '../tree/alignment';
import {
  type AuthoredMark,
  isAuthoredSetValued,
  readAuthoredMarks,
  readMembers,
} from '../tree/marks';
import { proposedSurvival } from '../tree/proposed';
import {
  type AuthoredHiddenBlock,
  type AuthoredPlacement,
  type AuthoredResolveSchema,
  followsOf,
  hasBoundaryMark,
  isTextBlock,
  resolveAuthoredChildren,
} from '../tree/resolve';
import { countLedgerWork, nodesIn } from './work';

export type BlockFacts = Readonly<{
  unmarked: boolean;
  /**
   * The pending joins blocks inside follow, and the joins blocks inside hold,
   * by incarnation: a follower lands after its join's line wherever the join
   * sits, so both resolve together.
   */
  follows: readonly string[];
  joins: readonly string[];
  /**
   * The incarnations of pending deletions inside. A suggested move strikes
   * its source under the incarnation that inserts its landing copy.
   */
  deletes: readonly string[];
  /**
   * No block inside carries a follower claim, so a run the commands wrote
   * can stand for it: a follower can land away from where it is written.
   */
  settles: boolean;
  /** A join or split can land on its first line, so it decides with the blocks before it. */
  opensWithStructure: boolean;
  /**
   * Whether the mode keeps one of its lines. A join reaches back over lines
   * the mode drops, so it passes over a block that keeps none.
   */
  keepsLine: Readonly<Record<AuthoredFormatProjection, boolean>>;
  /** It carries an insertion claim of its own, so it holds no prefix slot at the start. */
  inserted: boolean;
  removedProposed: boolean;
}>;

const FACTS = new WeakMap<JsonNode, BlockFacts>();

/**
 * What a block's facts read from its children, folded in order: an element
 * child gives its own facts, and a text its own members.
 *
 * @internal
 */
export type ChildFacts = Readonly<{
  deletes: Iterable<string>;
  follows: Iterable<string>;
  joins: Iterable<string>;
  /** The element children that keep a line, by mode. */
  kept: Readonly<Record<AuthoredFormatProjection, number>>;
  /** The children with a review member. */
  marked: number;
  /**
   * Whether the first child that opens with structure or holds no member
   * opens with structure. A line with review marks can vanish in one mode,
   * and an unwrap lifts the lines after it, so a join behind marked lines can
   * still open the block.
   */
  opens: boolean;
  /** The children that do not settle. */
  unsettled: number;
}>;

const ownKeys = (
  marks: readonly AuthoredMark[],
  keyOf: (mark: AuthoredMark) => string | undefined
) =>
  marks.flatMap((mark) => {
    const key = keyOf(mark);

    return key === undefined ? [] : [key];
  });

const deleteKey = (mark: AuthoredMark) =>
  mark.kind === 'delete' ? incarnationOf(mark) : undefined;

const joinKey = (mark: AuthoredMark) =>
  mark.kind === 'join' ? incarnationOf(mark) : undefined;

const SURVIVAL = {
  accepted: survivalUnder<JsonNode>((node) =>
    readAuthoredMarks(node).some((mark) => mark.kind === 'insert')
  ),
  proposed: proposedSurvival,
};

const childFactsOf = (node: JsonNode): ChildFacts => {
  const children = node.children ?? [];
  const deletes: string[] = [];
  const follows: string[] = [];
  const joins: string[] = [];
  const kept = { accepted: 0, proposed: 0 };
  let marked = 0;
  let opens: boolean | null = null;
  let unsettled = 0;

  countLedgerWork('factNodes', children.length);
  countLedgerWork('visitedNodes', children.length);
  for (const child of children) {
    if (typeof child.text === 'string') {
      const members = readMembers(child);

      if (members.length > 0) marked += 1;
      deletes.push(...ownKeys(readAuthoredMarks(child), deleteKey));
      if (opens === null && hasBoundaryMark(child)) opens = true;
      if (opens === null && members.length === 0) opens = false;
      continue;
    }

    const facts = blockFactsOf(child);

    if (!facts.unmarked) marked += 1;
    if (!facts.settles) unsettled += 1;
    if (facts.keepsLine.accepted) kept.accepted += 1;
    if (facts.keepsLine.proposed) kept.proposed += 1;
    deletes.push(...facts.deletes);
    follows.push(...facts.follows);
    joins.push(...facts.joins);
    if (opens === null && (facts.opensWithStructure || facts.unmarked)) {
      opens = facts.opensWithStructure;
    }
  }

  return {
    deletes,
    follows,
    joins,
    kept,
    marked,
    opens: !!opens,
    unsettled,
  };
};

/**
 * The facts of `node` from its own members and what its children give, the
 * one combine the facts of a block and of a container's level share.
 *
 * @internal
 */
export const combineFacts = (
  node: JsonNode,
  children: ChildFacts,
  textBlock = isTextBlock(node)
): BlockFacts => {
  countLedgerWork('factNodes');
  countLedgerWork('visitedNodes');

  const members = readMembers(node);

  if (members.length === 0 && children.marked === 0) return UNMARKED;

  const marks = readAuthoredMarks(node);
  const boundary = hasBoundaryMark(node);
  const fold = (
    keyOf: (mark: AuthoredMark) => string | undefined,
    inner: Iterable<string>
  ) => {
    const keys = new Set(ownKeys(marks, keyOf));
    let read = keys.size;

    for (const key of inner) {
      keys.add(key);
      read += 1;
    }
    countLedgerWork('claimKeys', read);

    return [...keys];
  };
  const follows = fold(followsOf, children.follows);

  return {
    unmarked: false,
    deletes: fold(deleteKey, children.deletes),
    follows,
    joins: fold(joinKey, children.joins),
    inserted: marks.some((mark) => mark.kind === 'insert'),
    keepsLine: textBlock
      ? {
          accepted: SURVIVAL.accepted.survives(node),
          proposed: SURVIVAL.proposed.survives(node),
        }
      : {
          accepted: children.kept.accepted > 0,
          proposed: children.kept.proposed > 0,
        },
    opensWithStructure: boundary || children.opens,
    removedProposed: !proposedSurvival.survives(node) && !boundary,
    settles: follows.length === 0 && children.unsettled === 0,
  };
};

/** @internal */
export const blockFactsOf = (node: JsonNode): BlockFacts => {
  let facts = FACTS.get(node);

  if (!facts) {
    countLedgerWork('blockFacts');
    facts = combineFacts(node, childFactsOf(node));
    FACTS.set(node, facts);
  }

  return facts;
};

/** Keep `facts`, derived elsewhere, as the facts of `node`. @internal */
export const primeFacts = (node: JsonNode, facts: BlockFacts) => {
  FACTS.set(node, facts);
};

const BUILT = new WeakSet<JsonNode>();

/** Whether completion built `node`, an element no stored node becomes. @internal */
export const isBuilt = (node: JsonNode) => BUILT.has(node);

const UNMARKED: BlockFacts = Object.freeze({
  unmarked: true,
  deletes: [],
  follows: [],
  inserted: false,
  joins: [],
  keepsLine: { accepted: true, proposed: true },
  opensWithStructure: false,
  removedProposed: false,
  settles: true,
});

export const removesBlock = (
  mode: AuthoredFormatProjection,
  facts: BlockFacts
) => mode === 'proposed' && facts.removedProposed;

/**
 * Where a run's output shows stored subtrees away from their stored place,
 * as the resolver's placements land them.
 */
export type RunOrder = Readonly<{
  /** The moved stored subtrees, in the order they land. */
  moved: readonly JsonNode[];
  /** The run's stored nodes with each moved subtree where it lands. */
  nodes: readonly JsonNode[];
  /**
   * The stored token ranges in the order the output shows them, each marked
   * when it lies in a moved subtree. The ranges outside moved subtrees keep
   * their stored order.
   */
  segments: ReadonlyArray<
    Readonly<{ from: number; moved: boolean; to: number }>
  >;
}>;

export type Run = Readonly<{
  /**
   * The change from the run's stored content, with `order`'s moves made, to
   * its output. On a run the commands wrote, built on its first read.
   */
  alignment: RootChange | null;
  /** False when no alignment paired the output's content and it was diffed. */
  aligned: boolean;
  /** Whether the run's resolve built an element no stored node becomes. */
  builds: boolean;
  /**
   * The change from the stored content to the output: each moved subtree
   * deleted and inserted where it lands, then `alignment`. Built on its first
   * read where the run has an order or the commands wrote it.
   */
  change: RootChange | null;
  /** Whether the run's output differs from its stored nodes, known without building `change`. */
  changed: boolean;
  /**
   * The stored blocks the output hides whole, by their path in `nodes`, with
   * the shown block of `output` each collapses into. Absent on a run the
   * commands wrote, which resolves no record of it, so a range there reads
   * the hidden blocks between its mapped ends, and on a level's run, whose
   * places read its level.
   */
  hidden?: readonly AuthoredHiddenBlock[];
  nodes: readonly JsonNode[];
  /** Null when the output shows every stored block in its stored order. */
  order: RunOrder | null;
  output: readonly JsonNode[];
  outputLength: number;
  part: ListPart;
  storedLength: number;
  verdicts: RecordSetVersion;
}>;

const deleting = (
  length: number,
  ranges: ReadonlyArray<readonly [number, number]>
) => {
  const sections: number[] = [];
  const data: Array<PreparedTokenSlice | null> = [];
  let at = 0;

  for (const [from, to] of ranges) {
    if (from > at) {
      sections.push(from - at, -1);
      data.push(null);
    }
    sections.push(to - from, 0);
    data.push(PreparedTokenSlice.empty);
    at = to;
  }
  if (length > at) {
    sections.push(length - at, -1);
    data.push(null);
  }

  return RootChange.fromSections(sections, data);
};

const samePart = (left: ListPart, right: ListPart) =>
  left.head === right.head && left.min === right.min;

const lengthOf = (nodes: readonly JsonNode[]) =>
  nodes.reduce((sum, node) => sum + tokenLength(node), 0);

// Every place a run maps passes through its order and then its alignment, so
// a run whose lengths disagree fails where it is built instead of where a
// place reads it.
const checkLengths = (
  storedLength: number,
  order: RunOrder | null,
  ordered: number,
  alignment: RootChange | null,
  outputLength: number
) => {
  const permuted =
    order?.segments.reduce((sum, { from, to }) => sum + to - from, 0) ??
    storedLength;

  if (
    permuted !== storedLength ||
    (order && lengthOf(order.nodes) !== permuted) ||
    ordered !== permuted ||
    (alignment ? alignment.length : ordered) !== ordered ||
    (alignment ? alignment.newLength : ordered) !== outputLength
  ) {
    throw new Error(
      `A run's lengths disagree: stored ${storedLength}, ordered ${ordered}, alignment ${alignment?.length} to ${alignment?.newLength}, output ${outputLength}.`
    );
  }
};

export type RunContext = Readonly<{
  facts: ReviewFacts;
  isSetValued: DocumentSetPropertyResolver;
  mode: AuthoredFormatProjection;
  root: string;
  schema: AuthoredResolveSchema | null;
  /** The containers the run's list sits in, nearest first; none at a root. */
  site?: readonly JsonNode[];
  /** The verdict set's version `facts` reads. */
  verdicts: RecordSetVersion;
}>;

const localChange = (
  kept: readonly JsonNode[],
  decided: Settled,
  context: RunContext
) => {
  const stored = { children: kept } as JsonEditorValue;
  let aligned = true;
  const change = getDefined(
    settledChange(stored, decided, (from, to) => {
      const alignment =
        context.mode === 'proposed'
          ? acceptedAlignment(from, to)
          : decidedAlignment(from, to, {
              facts: context.facts,
              outcomes: 'reject',
            });

      if (alignment) return alignment;
      aligned = false;

      return context.mode === 'proposed'
        ? diffedAcceptedChange(from, to, {
            isSetValued: context.isSetValued,
          })
        : DocumentChange.between(from, to, {
            isSetValued: isAuthoredSetValued,
          });
    })
  );

  return {
    aligned,
    change: change.empty
      ? null
      : (getInternalDocumentRootChange(change, 'main') ?? null),
  };
};

/** A tail run of one block the mode removes whole, which needs no kernel. */
export const removedRun = (node: JsonNode, context: RunContext): Run => {
  const storedLength = tokenLength(node);
  const change = deleting(storedLength, [[0, storedLength]]);

  return {
    alignment: change,
    aligned: true,
    builds: false,
    change,
    changed: true,
    hidden: [{ at: [0], owner: null }],
    nodes: [node],
    order: null,
    output: [],
    outputLength: 0,
    part: { head: false, min: 0 },
    storedLength,
    verdicts: context.verdicts,
  };
};

type Item = {
  children: Item[];
  dirty: boolean;
  from: number;
  node: JsonNode;
  parent: Item | null;
};

/**
 * The run's stored elements with each placement made, in the order the
 * resolver lands them, or null when it lands none.
 */
const orderOf = (
  nodes: readonly JsonNode[],
  placements: readonly AuthoredPlacement[]
): RunOrder | null => {
  if (placements.length === 0) return null;

  const items = new Map<JsonNode, Item>();
  const twice = new Set<JsonNode>();
  const top: Item = {
    children: [],
    dirty: false,
    from: 0,
    node: { children: [] },
    parent: null,
  };
  const build = (children: readonly JsonNode[], parent: Item, from: number) => {
    let at = from;

    for (const node of children) {
      if (typeof node.text !== 'string') {
        const item: Item = {
          children: [],
          dirty: false,
          from: at,
          node,
          parent,
        };

        if (items.has(node)) twice.add(node);
        items.set(node, item);
        parent.children.push(item);
        if (!isTextBlock(node)) build(node.children ?? [], item, at + 1);
      }
      at += tokenLength(node);
    }
  };
  const touch = (item: Item) => {
    for (let at: Item | null = item; at && !at.dirty; at = at.parent) {
      at.dirty = true;
    }
  };

  build(nodes, top, 0);
  // The resolver's placements must land each block after another block of
  // the run outside it; a run never falls back to a diff of its output.
  for (const { after, node } of placements) {
    const item = items.get(node);
    const target = items.get(after);

    if (!item || !target) {
      throw new Error('A placement names a block its run does not hold.');
    }
    if (twice.has(node) || twice.has(after)) {
      throw new Error('A placement names a block its run holds twice.');
    }
    for (let at: Item | null = target; at; at = at.parent) {
      if (at === item) {
        throw new Error('A placement lands a block inside itself.');
      }
    }

    const from = getDefined(item.parent);
    const into = getDefined(target.parent);

    from.children.splice(from.children.indexOf(item), 1);
    into.children.splice(into.children.indexOf(target) + 1, 0, item);
    item.parent = into;
    touch(from);
    touch(into);
  }

  const moved = new Set(placements.map(({ node }) => node));
  const segments: Array<{ from: number; moved: boolean; to: number }> = [];
  const push = (from: number, to: number, inMove: boolean) => {
    const last = segments.at(-1);

    if (last && last.to === from && last.moved === inMove) last.to = to;
    else segments.push({ from, moved: inMove, to });
  };
  const emit = (item: Item, inMove: boolean) => {
    const moves = inMove || moved.has(item.node);
    const end = item.from + tokenLength(item.node);

    if (!item.dirty) {
      push(item.from, end, moves);
      return;
    }
    push(item.from, item.from + 1, moves);
    for (const child of item.children) emit(child, moves);
    push(end - 1, end, moves);
  };
  // Only elements whose children are all elements take a moved block, so a
  // rebuilt element holds no text of its own.
  const nodeOf = ({ children, dirty, node }: Item): JsonNode =>
    dirty && node.children
      ? Object.freeze({
          ...node,
          children: Object.freeze(children.map(nodeOf)),
        })
      : node;

  for (const child of top.children) emit(child, false);

  return {
    moved: placements.map(({ node }) => node),
    nodes: Object.freeze(top.children.map(nodeOf)),
    segments,
  };
};

/**
 * The change from a run's stored content to `order`'s nodes: each moved
 * range deleted, and inserted between the stored ranges the order shows it
 * between.
 */
const permutationOf = (nodes: readonly JsonNode[], order: RunOrder) => {
  const index = DocumentIndex.fromIndexedNodes(nodes);
  const sections: number[] = [];
  const data: SectionData[] = [];
  let at = 0;
  let landing: PreparedTokenSlice[] = [];
  const land = (to: number) => {
    const slice = PreparedTokenSlice.concat(landing);

    addSection(sections, data, to - at, slice.length, slice);
    landing = [];
    at = to;
  };

  for (const { from, moved, to } of order.segments) {
    if (moved) {
      landing.push(index.slice(from, to));
      continue;
    }
    if (from < at) {
      throw new Error('A run order moved content outside its moved blocks.');
    }
    land(from);
    addSection(sections, data, to - from, -1, null);
    at = to;
  }
  land(index.length);

  return RootChange.fromSections(sections, data);
};

/**
 * Resolve one run through the kernel as `part` of its root. In a tail that
 * fills none of the minimum, blocks the mode removes whole become a
 * deletion, and the kept blocks resolve together. A head keeps every block,
 * since a removed one still decides whether a prefix slot is vacated, and so
 * does a run that fills the minimum, which completes even when no block
 * survives.
 */
export const resolveRun = (
  nodes: readonly JsonNode[],
  context: RunContext,
  cache: WeakMap<JsonNode, Run>,
  part: ListPart
): Run => {
  const cached = cache.get(getDefined(nodes[0]));

  if (
    cached &&
    cached.verdicts === context.verdicts &&
    samePart(cached.part, part) &&
    cached.nodes.length === nodes.length &&
    cached.nodes.every((node, index) => node === nodes[index])
  ) {
    return cached;
  }

  countLedgerWork('resolvedRuns');
  if (part.head) countLedgerWork('headRuns');
  if (part.min > 0 && !context.site) countLedgerWork('filledRuns');
  countLedgerWork('resolvedNodes', nodesIn(nodes));

  const input = inputOf(nodes, context, part);
  const { kept, tail } = input;
  const resolution =
    kept.length === 0 ||
    (tail &&
      context.mode === 'proposed' &&
      !kept.some(proposedSurvival.survives))
      ? null
      : deepFreeze(
          resolveAuthoredChildren(
            nodes,
            context.mode === 'proposed' ? 'accept' : 'reject',
            context.schema,
            context.root,
            {
              facts: context.facts,
              part,
              removed: input.removed,
              site: context.site,
            }
          )
        );
  const output = resolution?.children ?? [];
  const order = resolution ? orderOf(nodes, resolution.placements) : null;

  for (const node of resolution?.unstored ?? NOTHING_UNSTORED) BUILT.add(node);

  const aligning = order ? inputOf(order.nodes, context, part) : input;
  const { aligned, change: alignment } = changeOf(
    aligning,
    resolution ?? { children: output, unstored: NOTHING_UNSTORED },
    context
  );
  const outputLength = lengthOf(output);
  let change: RootChange | null = order ? null : alignment;

  checkLengths(
    input.storedLength,
    order,
    aligning.storedLength,
    alignment,
    outputLength
  );

  if (!aligned) countLedgerWork('unalignedRuns');

  const run: Run = {
    alignment,
    aligned,
    builds: (resolution?.unstored.size ?? 0) > 0,
    get change() {
      if (order) {
        change ??= alignment
          ? permutationOf(nodes, order).compose(alignment)
          : permutationOf(nodes, order);
      }

      return change;
    },
    changed: !!order || !!alignment,
    hidden: resolution?.hidden ?? [],
    nodes,
    order,
    output,
    outputLength,
    part,
    storedLength: input.storedLength,
    verdicts: context.verdicts,
  };

  cache.set(getDefined(nodes[0]), run);

  return run;
};

/**
 * A run whose output the frame's commands wrote, which its stored nodes
 * project to, so the kernel need not resolve it.
 */
export const writtenRun = (
  nodes: readonly JsonNode[],
  output: readonly JsonNode[],
  context: RunContext,
  cache: WeakMap<JsonNode, Run>,
  part: ListPart
): Run => {
  countLedgerWork('writtenRuns');
  countLedgerWork('writtenNodes', nodesIn(nodes));

  const input = inputOf(nodes, context, part);
  const changed =
    input.ranges.length > 0 ||
    output.length !== input.kept.length ||
    output.some((node, index) => !jsonEqual(node, input.kept[index]));
  const outputLength = lengthOf(output);
  let change: RootChange | null = null;
  let aligned = true;
  const built = () => {
    if (changed && !change) {
      const local = changeOf(
        input,
        { children: output, unstored: NOTHING_UNSTORED },
        context
      );

      ({ aligned } = local);
      change = local.change ?? RootChange.empty(input.storedLength);
      checkLengths(
        input.storedLength,
        null,
        input.storedLength,
        change,
        outputLength
      );
    }

    return change;
  };
  const run: Run = {
    get alignment() {
      return built();
    },
    get aligned() {
      built();

      return aligned;
    },
    builds: false,
    get change() {
      return built();
    },
    changed,
    nodes,
    order: null,
    output,
    outputLength,
    part,
    storedLength: input.storedLength,
    verdicts: context.verdicts,
  };

  cache.set(getDefined(nodes[0]), run);

  return run;
};

const inputOf = (
  nodes: readonly JsonNode[],
  context: RunContext,
  part: ListPart
) => {
  const tail = !part.head && part.min === 0;
  const removed = new Set(
    tail
      ? nodes.filter((node) => removesBlock(context.mode, blockFactsOf(node)))
      : []
  );
  const kept = nodes.filter((node) => !removed.has(node));
  const ranges: Array<[number, number]> = [];
  let storedLength = 0;

  for (const node of nodes) {
    const length = tokenLength(node);

    if (removed.has(node)) {
      const last = ranges.at(-1);

      if (last && last[1] === storedLength) last[1] += length;
      else ranges.push([storedLength, storedLength + length]);
    }
    storedLength += length;
  }

  return { kept, ranges, removed, storedLength, tail };
};

const changeOf = (
  { kept, ranges, storedLength }: ReturnType<typeof inputOf>,
  settled: Settled,
  context: RunContext
) => {
  const local =
    kept.length > 0
      ? localChange(kept, settled, context)
      : { aligned: true, change: null };

  if (ranges.length === 0) return local;

  const removal = deleting(storedLength, ranges);

  return {
    aligned: local.aligned,
    change: local.change ? removal.compose(local.change) : removal,
  };
};
