import { DocumentIndex } from '../../core/change/document-index';
import { jsonEqual } from '../../core/change/json';
import {
  addSection,
  RootChange,
  type SectionData,
} from '../../core/change/root-change';
import { type JsonNode, PreparedTokenSlice } from '../../core/change/tokens';
import type {
  ProjectionBreak,
  RangePlacement,
} from '../../core/command-document';
import type { ChangedRange } from '../../core/measured-sequence';
import type { ListPart } from '../../core/representation';
import { countCoreWork } from '../../core/work';
import { getDefined } from '../../internal/get-defined';
import type { AuthoredFormatProjection } from '../format';
import { tokenLength } from '../tree/alignment';
import { readMembers } from '../tree/marks';
import { isTextBlock } from '../tree/resolve';
import { type BlockLine, type Span, spansOf } from './links';
import { ContainerPlaces, placesOf } from './places';
import {
  type BlockFacts,
  blockFactsOf,
  combineFacts,
  primeFacts,
  type Run,
  type RunContext,
  removedRun,
  removesBlock,
  resolveRun,
  writtenRun,
} from './runs';
import { type Slot, SlotTree } from './slots';
import {
  countLedgerWork,
  nodesIn,
  noteGateWindow,
  noteLevelFacts,
} from './work';

const STORED_LENGTH = 0;
const OUTPUT_LENGTH = 1;
const OUTPUT_BLOCKS = 2;
const CHANGED_RUNS = 3;
const KEPT_ACCEPTED = 4;
const KEPT_PROPOSED = 5;
const PENDING = 6;
const ORDERED_RUNS = 7;
const MARKED = 8;
const UNSETTLED = 9;
const STOPS = 10;
const BUILT = 11;
const MEASURES = 12;

const KEPT_LINES = {
  accepted: KEPT_ACCEPTED,
  proposed: KEPT_PROPOSED,
} as const;

/**
 * Projected blocks `first` to `end` the kernel resolved. A window of one
 * container its level showed holds the level's own windows, by the ranks of
 * the container's children, and null otherwise.
 */
export type ResolvedWindow = Readonly<{
  end: number;
  first: number;
  inner: readonly ResolvedWindow[] | null;
}>;

/**
 * What a level made of its children when its container showed: the change
 * from the children it showed before, the windows it resolved, and whether
 * it took the frame's write for all of them.
 */
type LevelStep = Readonly<{
  adopted: boolean;
  change: RootChange | null;
  windows: readonly ResolvedWindow[];
}>;

/** A container that shows through its level, as one run of its list. */
type LevelRun = Run &
  Readonly<{
    level: Level;
    places: ContainerPlaces;
    step: LevelStep;
  }>;

/** A run with an order, with its first slot's rank and where its stored and projected content start. */
type OrderedRunAt = Readonly<{
  output: number;
  rank: number;
  run: Run | LevelRun;
  stored: number;
}>;

/** The stored and projected spans of one run with an order. */
type OrderedSpan = Readonly<{
  output: readonly [number, number];
  stored: readonly [number, number];
}>;

type BlockSlot = Slot & {
  /**
   * On a pending slot, whether a run it replaced built an element, which the
   * frame's write may still hold with no stored node behind it.
   */
  built?: boolean;
  facts: BlockFacts;
  /** The container's children, projected, while they complete apart and hold no text. */
  level: Level | null;
  node: JsonNode;
  offset: number;
  run: Run | LevelRun | null;
  /** The level whose container the projected list shows where the slot's output stands. */
  shows: Level | null;
};

export const isLevelRun = (run: Run | null): run is LevelRun =>
  !!run && 'level' in run;

const placesAt = (run: Run | LevelRun) =>
  isLevelRun(run) ? run.places : placesOf(run);

const measuresOf = (
  { facts, level, node }: Pick<BlockSlot, 'facts' | 'level' | 'node'>,
  {
    blocks = 0,
    built = false,
    changed = false,
    length = 0,
    ordered = false,
    pending = false,
  }: Readonly<{
    blocks?: number;
    built?: boolean;
    changed?: boolean;
    length?: number;
    ordered?: boolean;
    pending?: boolean;
  }>
) => [
  level ? level.storedLength : tokenLength(node),
  length,
  blocks,
  changed ? 1 : 0,
  facts.keepsLine.accepted ? 1 : 0,
  facts.keepsLine.proposed ? 1 : 0,
  pending ? 1 : 0,
  ordered ? 1 : 0,
  facts.unmarked ? 0 : 1,
  facts.settles ? 0 : 1,
  facts.unmarked || facts.opensWithStructure ? 1 : 0,
  built ? 1 : 0,
];

const isPending = (slot: BlockSlot) => slot.measures[PENDING] === 1;

// Projected blocks `first` to `last` give way to the output of `slots`,
// `blocks` blocks. `shows` is the level whose container the one block the
// edit replaces shows.
type OutputEdit = Readonly<{
  blocks: number;
  first: number;
  last: number;
  shows: Level | null;
  slots: readonly BlockSlot[];
}>;

/**
 * What a frame's commands wrote in a list of sibling blocks, a root's or a
 * container's: the projection of the stored list its recording left, and the
 * change to it from the projection they decided on.
 */
export type WrittenList = Readonly<{
  change: RootChange;
  index: DocumentIndex;
}>;

type WindowPart = Readonly<{
  head: boolean;
  /**
   * The minimum the window's last run fills, given the blocks the window's
   * runs before it output and the slot offset where it starts in the window.
   */
  min: (blocks: number, offset: number) => number;
}>;

const unmarkedSlot = (slot: BlockSlot): BlockSlot => ({
  facts: slot.facts,
  leaf: null,
  level: slot.level,
  measures: measuresOf(slot, {
    blocks: 1,
    length: slot.level ? slot.level.storedLength : tokenLength(slot.node),
  }),
  node: slot.node,
  offset: 0,
  run: null,
  shows: null,
});

const runSlots = (group: readonly BlockSlot[], run: Run) =>
  group.map((slot, offset): BlockSlot => ({
    facts: slot.facts,
    leaf: null,
    level: slot.level,
    measures: measuresOf(
      slot,
      offset === 0
        ? {
            blocks: run.output.length,
            built: run.builds,
            changed: run.changed,
            length: run.outputLength,
            ordered: !!run.order,
          }
        : {}
    ),
    node: slot.node,
    offset,
    run,
    shows: null,
  }));

const levelSlot = (slot: BlockSlot, run: LevelRun): BlockSlot => ({
  facts: slot.facts,
  leaf: null,
  level: run.level,
  measures: measuresOf(slot, {
    blocks: 1,
    built: run.builds,
    changed: run.changed,
    length: run.outputLength,
    ordered: run.level.reorders,
  }),
  node: slot.node,
  offset: 0,
  run,
  shows: run.level,
});

const groupsOf = (window: readonly BlockSlot[], joinsPrevious: Uint8Array) => {
  const groups: Array<readonly BlockSlot[]> = [];

  for (let index = 0; index < window.length;) {
    let end = index + 1;

    while (end < window.length && joinsPrevious[end]) end += 1;
    groups.push(window.slice(index, end));
    index = end;
  }

  return groups;
};

const isUnmarked = (group: readonly BlockSlot[]) =>
  group.length === 1 && getDefined(group[0]).facts.unmarked;

// An unmarked block resolves to itself, which fills a minimum of one.
const unmarkedFills = (min: number) => min <= 1;

// A container shows as one block, so its level serves a group that is the
// container alone and fills at most a minimum of one.
const showsThrough = (
  group: readonly BlockSlot[],
  head: boolean,
  min: number
) => group.length === 1 && !!group[0]?.level && !head && min <= 1;

const isContainer = (node: JsonNode) =>
  typeof node.text !== 'string' && !!node.children && !isTextBlock(node);

const countWhole = (group: readonly BlockSlot[]) => {
  const whole = group.filter(
    ({ level, node }) => !!level || isContainer(node)
  ).length;

  if (whole > 0) countLedgerWork('wholeContainers', whole);
};

const siteOf = (context: RunContext, container: JsonNode): RunContext => ({
  ...context,
  site: [container, ...(context.site ?? [])],
});

const countSlots = (context: RunContext, slots: readonly BlockSlot[]) => {
  countLedgerWork('windowSlots', slots.length);
  if (context.site?.length) countLedgerWork('levelSlots', slots.length);
};

const resolveWindow = (
  window: readonly BlockSlot[],
  joinsPrevious: Uint8Array,
  context: RunContext,
  cache: WeakMap<JsonNode, Run>,
  part: WindowPart,
  records = false
) => {
  const slots: BlockSlot[] = [];
  const groups = groupsOf(window, joinsPrevious);
  let blocks = 0;

  for (const [rank, group] of groups.entries()) {
    const first = getDefined(group[0]);
    const index = slots.length;
    const min = rank === groups.length - 1 ? part.min(blocks, index) : 0;
    const head = index === 0 && part.head;

    if (first.level && showsThrough(group, head, min)) {
      slots.push(
        levelSlot(
          first,
          first.level.show(
            first.node,
            siteOf(context, first.node),
            min,
            null,
            records
          )
        )
      );
      blocks += 1;
      continue;
    }
    if (isUnmarked(group) && unmarkedFills(min)) {
      slots.push(unmarkedSlot(first));
      blocks += 1;
      continue;
    }

    countWhole(group);

    const run =
      group.length === 1 &&
      !head &&
      min === 0 &&
      removesBlock(context.mode, first.facts)
        ? removedRun(first.node, context)
        : resolveRun(
            group.map((slot) => slot.node),
            context,
            cache,
            { head, min }
          );

    slots.push(...runSlots(group, run));
    blocks += run.output.length;
  }
  countSlots(context, slots);

  return slots;
};

// A follower can land away from where the commands wrote it, and a
// suggested move strikes its source under the incarnation that inserts its
// copy, so a window holding either resolves: a written run has no order.
export const settles = (
  { deletes, settles: own }: BlockFacts,
  context: RunContext
) =>
  own &&
  (deletes.length === 0 ||
    !deletes.some((incarnation) =>
      context.facts.insertedIncarnations().has(incarnation)
    ));

const unsettled = (window: readonly BlockSlot[], context: RunContext) =>
  window.some((slot) => slot.built || !settles(slot.facts, context));

/**
 * The window's slots when the frame's commands wrote its `output`: unmarked
 * blocks stay themselves, and the window's one other group takes the rest of
 * the output, so no kernel runs. Null when the window holds no such group or
 * more than one, when the output does not fit around its unmarked blocks, or
 * when an unmarked block ends the window with more than one block of the
 * list's minimum to fill.
 */
const writtenWindow = (
  window: readonly BlockSlot[],
  joinsPrevious: Uint8Array,
  context: RunContext,
  cache: WeakMap<JsonNode, Run>,
  part: WindowPart,
  output: readonly JsonNode[]
) => {
  if (unsettled(window, context)) return null;

  const groups = groupsOf(window, joinsPrevious);
  const before = groups.findIndex((group) => !isUnmarked(group));
  const group = groups[before];

  if (!group || groups.slice(before + 1).some((other) => !isUnmarked(other))) {
    return null;
  }

  const after = groups.length - before - 1;
  const written = output.length - before - after;
  const ahead = window.slice(0, before);
  const behind = window.slice(window.length - after);

  if (
    written < 0 ||
    ahead.some((slot, index) => slot.node !== output[index]) ||
    behind.some(
      (slot, index) => slot.node !== output[before + written + index]
    ) ||
    (after > 0 &&
      !unmarkedFills(part.min(output.length - 1, window.length - 1)))
  ) {
    return null;
  }

  countWhole(group);

  const run = writtenRun(
    group.map((slot) => slot.node),
    output.slice(before, before + written),
    context,
    cache,
    {
      head: before === 0 && part.head,
      min: after === 0 ? part.min(before, before) : 0,
    }
  );
  const slots = [
    ...ahead.map(unmarkedSlot),
    ...runSlots(group, run),
    ...behind.map(unmarkedSlot),
  ];

  countSlots(context, slots);

  return slots;
};

const changesWithin = (change: RootChange, from: number, to: number) => {
  let at = 0;

  for (let pair = 0; pair < change.sections.length; pair += 2) {
    countCoreWork('sectionsWalked');

    const length = getDefined(change.sections[pair]);

    if (
      getDefined(change.sections[pair + 1]) >= 0 &&
      (at < from || at + length > to)
    ) {
      return false;
    }
    at += length;
  }

  return true;
};

const outputOf = (slots: readonly BlockSlot[]) =>
  slots.flatMap((slot) =>
    slot.run ? (slot.offset === 0 ? slot.run.output : []) : [slot.node]
  );

const blocksOf = (slots: readonly BlockSlot[]) =>
  slots.reduce(
    (sum, slot) => sum + getDefined(slot.measures[OUTPUT_BLOCKS]),
    0
  );

const typeOf = (node: JsonNode | undefined) =>
  typeof node?.type === 'string' ? node.type : null;

const contentOf = (context: RunContext) =>
  context.schema?.content(typeOf(context.site?.[0]), context.root) ?? null;

// A container's children complete apart from the rest of their list only
// when its content has no prefix and no maximum. A text block passes, so
// the caller rules it out: a carried level from the children the commit
// changed, a new one from the whole node.
const completesApart = (node: JsonNode, context: RunContext) => {
  if (
    typeof node.type !== 'string' ||
    !node.children ||
    node.children.length === 0 ||
    readMembers(node).length > 0
  ) {
    return false;
  }

  const content = context.schema?.content(node.type, context.root);

  return !content || (content.prefix === 0 && content.max === null);
};

const ownFields = ({ children: _children, ...own }: JsonNode) => own;

export const keepsOwn = (left: JsonNode, right: JsonNode) =>
  left.type === right.type && jsonEqual(ownFields(left), ownFields(right));

// How many stored blocks the root's head holds: through its first `prefix`
// blocks no insertion holds, which a decision weighs for the prefix slots,
// and its first `prefix` blocks that keep a line, so the head's own output
// fills the slots as the whole root's would.
const headLength = (
  stored: DocumentIndex,
  context: RunContext,
  mode: AuthoredFormatProjection
) => {
  const prefix = contentOf(context)?.prefix ?? 0;
  let held = 0;
  let kept = 0;
  let rank = 0;

  for (; rank < stored.size && (held < prefix || kept < prefix); rank += 1) {
    const facts = blockFactsOf(getDefined(stored.child(rank)));

    countLedgerWork('visitedNodes');
    if (!facts.inserted) held += 1;
    if (facts.keepsLine[mode]) kept += 1;
  }

  return rank;
};

export const compose = (
  composed: RootChange | null,
  step: RootChange | null
) => (composed && step ? composed.compose(step) : (composed ?? step));

/**
 * The review projection of one list of sibling blocks under one mode: a
 * root's, or a container's children while the container carries a level.
 *
 * @internal
 */
export class Level {
  protected cache = new WeakMap<JsonNode, Run>();
  private readonly deleters = new Map<string, Set<BlockSlot>>();
  private readonly followers = new Map<string, Set<BlockSlot>>();
  private readonly joiners = new Map<string, Set<BlockSlot>>();
  /** What `pend` projected since the container last showed. */
  private held: RootChange | null = null;
  private depth = 0;
  protected projected!: DocumentIndex;
  /** The container as the list it sits in shows it. */
  private shown: JsonNode | null = null;
  protected slots!: SlotTree<BlockSlot>;
  protected stored!: DocumentIndex;

  readonly mode: AuthoredFormatProjection;

  protected get builds() {
    return this.slots.total(BUILT) > 0;
  }

  constructor(
    mode: AuthoredFormatProjection,
    stored: DocumentIndex,
    context: RunContext
  ) {
    this.mode = mode;
    this.build(stored, context);
  }

  get changed() {
    return this.slots.total(CHANGED_RUNS) > 0;
  }

  /** The token length of the container whose children this level lists. */
  get storedLength() {
    return this.stored.length + 2;
  }

  /**
   * Take the container's new children, pending those the commit changed,
   * and every marked one when a verdict touched the container. False, and
   * nothing taken, when a changed child is a text, so the container became
   * a text block.
   */
  carry(stored: DocumentIndex, context: RunContext, touched: boolean) {
    const ranges = this.stored.changedChildren(stored);

    for (const { 2: fromB, 3: toB } of ranges) {
      countLedgerWork('textScans', toB - fromB);
      for (let rank = fromB; rank < toB; rank += 1) {
        if (typeof stored.child(rank)?.text === 'string') return false;
      }
    }
    this.depth = context.site?.length ?? 0;
    this.held = compose(this.held, this.pend(ranges, stored, context));
    this.stored = stored;
    if (touched) this.pendMarked(context);

    return true;
  }

  /**
   * The container's facts, from its children's counts and keys, as
   * `blockFactsOf` gives them.
   */
  factsOf(container: JsonNode): BlockFacts {
    const facts = combineFacts(
      container,
      {
        deletes: this.deleters.keys(),
        follows: this.followers.keys(),
        joins: this.joiners.keys(),
        kept: {
          accepted: this.slots.total(KEPT_ACCEPTED),
          proposed: this.slots.total(KEPT_PROPOSED),
        },
        marked: this.slots.total(MARKED),
        opens:
          this.slots.total(STOPS) > 0 &&
          this.slots.at(this.slots.search(STOPS, 0, false)).facts
            .opensWithStructure,
        unsettled: this.slots.total(UNSETTLED),
      },
      false
    );

    primeFacts(container, facts);
    noteLevelFacts(container, facts, this.depth);

    return facts;
  }

  /**
   * Show `container` through this level: resolve the children that pend,
   * then complete the list, and take `written`, the frame's write of the
   * children, where a lone window allows. `min` is the share of its own
   * list's minimum the container fills. Given `records`, the step keeps the
   * windows the kernel resolved for the frame's check.
   */
  show(
    container: JsonNode,
    context: RunContext,
    min: number,
    written: WrittenList | null,
    records: boolean
  ): LevelRun {
    this.depth = context.site?.length ?? 0;

    const line = this.lineOf(this.stored, context);
    const resolved = this.resolvePending(
      line,
      context,
      written,
      this.held === null,
      records
    );
    const settled = this.settle(line, context);
    const step: LevelStep = {
      adopted: resolved.adopted && !settled,
      change: compose(compose(this.held, resolved.change), settled),
      windows: resolved.windows,
    };

    this.held = null;
    this.shown = null;

    return this.runOf(container, { head: false, min }, context, step);
  }

  private runOf(
    container: JsonNode,
    part: ListPart,
    context: RunContext,
    step: LevelStep
  ): LevelRun {
    const { storedLength } = this;
    const outputLength = this.projected.length + 2;
    let change: RootChange | null | undefined;

    return {
      alignment: null,
      aligned: true,
      builds: this.builds,
      get change() {
        if (change === undefined) {
          change = this.level.changed
            ? this.level.changeOfRuns().embed(storedLength, 1)
            : null;
        }

        return change;
      },
      changed: this.changed,
      level: this,
      nodes: [container],
      order: null,
      get output() {
        return [this.level.shownAs(container)];
      },
      outputLength,
      part,
      places: new ContainerPlaces(this, storedLength, outputLength),
      spares: context.spares,
      step,
      storedLength,
      verdicts: context.verdicts,
    };
  }

  private shownAs(container: JsonNode) {
    this.shown ??= Object.freeze({
      ...container,
      children: Object.freeze(this.projected.nodes.slice()),
    }) as JsonNode;

    return this.shown;
  }

  private showAt(shown: JsonNode) {
    this.shown = shown;
  }

  protected pend(
    ranges: readonly ChangedRange[],
    stored: DocumentIndex,
    context: RunContext
  ) {
    let composed: RootChange | null = null;

    for (let next = ranges.length - 1; next >= 0;) {
      let [fromA, toA, fromB, toB] = getDefined(ranges[next]);

      next -= 1;
      for (let grown = true; grown;) {
        grown = false;

        const start = this.reachStart(fromA);

        if (start < fromA) {
          fromB -= fromA - start;
          fromA = start;
          grown = true;
        }
        if (toA > fromA) {
          const end = this.endOf(toA - 1);

          if (end > toA) {
            toB += end - toA;
            toA = end;
            grown = true;
          }
        }
        while (next >= 0 && fromA < getDefined(ranges[next])[1]) {
          const [leftA, , leftB] = getDefined(ranges[next]);

          fromB = leftA < fromA ? leftB : fromA + leftB - leftA;
          fromA = Math.min(fromA, leftA);
          next -= 1;
          grown = true;
        }
      }

      if (toB === fromB) {
        composed = compose(composed, this.replace(fromA, toA, [], context));
      } else {
        this.wait(fromA, toA, stored, fromB, toB - fromB, context, false);
      }
    }

    return composed;
  }

  private reachStart(rank: number) {
    if (rank < this.slots.size) return this.headRank(rank);
    if (rank === 0) return rank;

    const filler = this.headRank(rank - 1);

    return (this.slots.at(filler).run?.part.min ?? 0) > 0 ? filler : rank;
  }

  protected pendReaches([fromA, toA]: ChangedRange, rank: number) {
    const end = toA > fromA ? this.endOf(toA - 1) : fromA;

    return this.reachStart(fromA) <= rank && rank < end;
  }

  protected pendRun(rank: number, context: RunContext) {
    const slot = this.slots.at(rank);

    if (isPending(slot)) {
      slot.level?.pendMarked(siteOf(context, slot.node));
      return;
    }

    const from = this.headRank(rank);
    const to = this.endOf(rank);

    this.wait(from, to, this.stored, from, to - from, context, true);
  }

  private pendMarked(context: RunContext) {
    for (let count = 0; count < this.slots.total(MARKED); count += 1) {
      this.pendRun(this.slots.search(MARKED, count, false), context);
    }
  }

  // Slots `from` to `to` give way to the `count` stored blocks from `at`,
  // pending. A container keeps the level of the slot it replaces while it
  // keeps that slot's type and own fields.
  private wait(
    from: number,
    to: number,
    stored: DocumentIndex,
    at: number,
    count: number,
    context: RunContext,
    touched: boolean
  ) {
    const old: BlockSlot[] = [];

    this.slots.forEach(from, to, (slot) => {
      old.push(slot);
    });

    const lone = old.length === 1 && count === 1 ? old[0] : undefined;
    const shows =
      lone &&
      (isPending(lone) ? lone.shows : isLevelRun(lone.run) && lone.level);
    const replaced = {
      blocks:
        this.slots.sumBefore(to, OUTPUT_BLOCKS) -
        this.slots.sumBefore(from, OUTPUT_BLOCKS),
      length:
        this.slots.sumBefore(to, OUTPUT_LENGTH) -
        this.slots.sumBefore(from, OUTPUT_LENGTH),
    };
    const built = old.some((slot) => slot.run?.builds);
    const carried = new Set<Level>();
    const levelOf = (node: JsonNode, rank: number, offset: number) => {
      if (!completesApart(node, context)) return null;

      const children = getDefined(stored.childrenAt(rank));
      const site = siteOf(context, node);
      const source = [old[offset], old[old.length - count + offset]].find(
        (slot) =>
          slot?.level && !carried.has(slot.level) && keepsOwn(slot.node, node)
      );

      if (source?.level) {
        if (!source.level.carry(children, site, touched)) return null;
        carried.add(source.level);

        return source.level;
      }
      if (isTextBlock(node)) return null;
      countLedgerWork('levelBuilds');

      return new Level(this.mode, children, site);
    };
    const slots = Array.from({ length: count }, (_, offset): BlockSlot => {
      const node = getDefined(stored.child(at + offset));
      const level = levelOf(node, at + offset, offset);
      const facts = level ? level.factsOf(node) : blockFactsOf(node);

      return {
        ...(built ? { built } : {}),
        facts,
        leaf: null,
        level,
        measures: measuresOf(
          { facts, level, node },
          { ...(offset === 0 ? replaced : {}), built, pending: true }
        ),
        node,
        offset: 0,
        run: null,
        shows: (offset === 0 && shows) || null,
      };
    });

    for (const slot of old) this.relate(slot, false);
    this.slots.splice(from, to - from, slots);
    for (const slot of slots) this.relate(slot, true);
  }

  // Windows whose output meets, such as two that only blocks the mode removes
  // keep apart, project in one step, so the list's index is rebuilt once for
  // them. Once `pend` projects a deletion, the projected list may no longer be
  // the one the commands decided on, so no window adopts `written`.
  protected resolvePending(
    line: BlockLine,
    context: RunContext,
    written: WrittenList | null,
    adopts: boolean,
    records: boolean
  ) {
    let composed: RootChange | null = null;
    let batch: OutputEdit | null = null;
    const windows: ResolvedWindow[] = [];
    const flush = () => {
      if (batch) composed = compose(composed, this.project(batch, context));
      batch = null;
    };

    while (this.slots.total(PENDING) > 0) {
      const { from, spans, to } = this.closedWindow(
        this.slots.search(PENDING, 0, false),
        line
      );
      const part: WindowPart = {
        head: from === 0 && line.headLength > 0,
        min: this.endingMin(from, to, context),
      };
      const [window, joinsPrevious] = this.windowOf(from, to, spans);
      let slots: BlockSlot[] | null = null;

      // One window holds all the pending blocks, so `written` holds its
      // output where its old output was.
      if (
        written &&
        adopts &&
        !batch &&
        this.slots.sumBefore(to, PENDING) -
          this.slots.sumBefore(from, PENDING) ===
          this.slots.total(PENDING)
      ) {
        const [only] = window;
        const min = part.min(0, 0);

        if (only?.level && showsThrough(window, part.head, min)) {
          const run = only.level.show(
            only.node,
            siteOf(context, only.node),
            min,
            this.writtenWithin(written, from, only),
            records
          );

          slots = [levelSlot(only, run)];
          if (run.step.adopted) {
            this.splice(from, to, slots);
            this.projected = written.index;
            only.level.showAt(
              getDefined(
                written.index.child(this.slots.sumBefore(from, OUTPUT_BLOCKS))
              )
            );

            return { adopted: true, change: written.change, windows };
          }
        } else {
          const output = this.writtenOutput(written, from, to);
          const adopted =
            output &&
            writtenWindow(
              window,
              joinsPrevious,
              context,
              this.cache,
              part,
              output
            );

          noteGateWindow(() => window.map((slot) => slot.node), !!adopted);
          if (adopted) {
            this.splice(from, to, adopted);
            this.projected = written.index;

            return { adopted: true, change: written.change, windows };
          }
        }
      }

      const edit = this.splice(
        from,
        to,
        slots ??
          resolveWindow(
            window,
            joinsPrevious,
            context,
            this.cache,
            part,
            records
          )
      );

      if (records && unsettled(window, context)) record(windows, edit);

      if (embeddedRun(edit)) {
        flush();
        composed = compose(composed, this.project(edit, context));
      } else if (batch && edit.first === batch.first + batch.blocks) {
        batch = {
          blocks: batch.blocks + edit.blocks,
          first: batch.first,
          last: batch.last + edit.last - edit.first,
          shows: null,
          slots: [...batch.slots, ...edit.slots],
        };
      } else {
        flush();
        batch = edit;
      }
    }
    flush();

    return { adopted: false, change: composed, windows };
  }

  // The frame's write of the container at slot `from`, which shows as one
  // block through `slot`'s level: its children, and the change to them when
  // the change lies inside the container.
  private writtenWithin(
    { change, index }: WrittenList,
    from: number,
    slot: BlockSlot
  ): WrittenList | null {
    const first = this.slots.sumBefore(from, OUTPUT_BLOCKS);

    if (
      slot.shows !== slot.level ||
      index.size !== this.projected.size ||
      typeOf(index.child(first)) !== typeOf(slot.node)
    ) {
      return null;
    }

    const inside = change.within(
      this.projected.childPosition([], first) + 1,
      this.projected.childPosition([], first + 1) - 1
    );
    const children = index.childrenAt(first);

    return inside && children ? { change: inside, index: children } : null;
  }

  private writtenOutput(
    { change, index }: WrittenList,
    from: number,
    to: number
  ) {
    const first = this.slots.sumBefore(from, OUTPUT_BLOCKS);
    const last = this.slots.sumBefore(to, OUTPUT_BLOCKS);
    const after = this.projected.size - last;

    return index.size >= first + after &&
      changesWithin(
        change,
        this.projected.childPosition([], first),
        this.projected.childPosition([], last)
      )
      ? index.nodes.slice(first, index.size - after)
      : null;
  }

  // A window that ends the list gives its last run the minimum the blocks
  // before that run leave, so `settle` need not resolve the run again. While
  // the list's prefix still lies in the window's output, `settle` decides.
  private endingMin(
    from: number,
    to: number,
    context: RunContext
  ): WindowPart['min'] {
    const firstBlock = this.slots.sumBefore(from, OUTPUT_BLOCKS);

    if (
      to < this.slots.size ||
      firstBlock < (contentOf(context)?.prefix ?? 0)
    ) {
      return () => 0;
    }

    return (blocks, offset) =>
      this.fillOf(from + offset, firstBlock + blocks, context);
  }

  // The kernel fills a list's minimum at its end, so the run that starts at
  // `start` and ends the list fills what the `before` blocks ahead of it
  // leave. It completes nothing in a list whose prefix holds a block that
  // fits no prefix slot, so a run that does not start the list fills no
  // minimum then.
  private fillOf(start: number, before: number, context: RunContext) {
    const content = contentOf(context);
    const fits = (slot: number) => {
      const node = this.outputBlock(slot);

      return (
        !node ||
        (context.schema?.fitsPrefix?.(node, slot, context.root) ?? true)
      );
    };

    return start > 0 &&
      !Array.from({ length: content?.prefix ?? 0 }, (_, slot) => slot).every(
        fits
      )
      ? 0
      : Math.max(0, (content?.min ?? 0) - before);
  }

  // Read from the slots, which hold every window's output before
  // `projected` takes the batch.
  private outputBlock(index: number): JsonNode | undefined {
    const rank = this.slots.search(OUTPUT_BLOCKS, index, false);

    if (rank === this.slots.size) return undefined;

    const slot = this.slots.at(rank);

    return (slot.run ? slot.run.output : [slot.node])[
      index - this.slots.sumBefore(rank, OUTPUT_BLOCKS)
    ];
  }

  private closedWindow(start: number, line: BlockLine) {
    const spans = new Map<number, readonly Span[]>();
    let from = start;
    let to = start + 1;
    let scannedFrom = start;
    let scannedTo = start;
    const scan = (rank: number) => {
      // An unmarked block links to nothing past the head.
      if (line.facts(rank).unmarked && rank >= line.headLength) return;

      const own = spansOf(line, rank);

      countLedgerWork('visitedNodes');
      spans.set(rank, own);
      for (const [first, last] of own) {
        from = Math.min(from, first);
        to = Math.max(to, last + 1);
      }
    };

    for (;;) {
      from = this.startOf(from);
      to = this.endOf(to - 1);
      if (from === scannedFrom && to === scannedTo) break;

      const [left, right] = [from, to];

      for (let rank = left; rank < scannedFrom; rank += 1) scan(rank);
      for (let rank = scannedTo; rank < right; rank += 1) scan(rank);
      scannedFrom = left;
      scannedTo = right;
    }

    return { from, spans, to };
  }

  private cut(
    from: number,
    to: number,
    spans: ReadonlyMap<number, readonly Span[]>,
    context: RunContext,
    part: WindowPart
  ) {
    return resolveWindow(
      ...this.windowOf(from, to, spans),
      context,
      this.cache,
      part
    );
  }

  private windowOf(
    from: number,
    to: number,
    spans: ReadonlyMap<number, readonly Span[]>
  ) {
    const joinsPrevious = new Uint8Array(to - from);
    const window: BlockSlot[] = [];

    for (const own of spans.values()) {
      for (const [first, last] of own) {
        joinsPrevious.fill(1, first - from + 1, last - from + 1);
      }
    }
    this.slots.forEach(from, to, (slot) => {
      window.push(slot);
    });

    return [window, joinsPrevious] as const;
  }

  protected lineOf(stored: DocumentIndex, context: RunContext): BlockLine {
    const ranksOf = (slots: ReadonlySet<BlockSlot> | undefined) =>
      [...(slots ?? [])].map((slot) => this.slots.rankOf(slot));
    const kept = KEPT_LINES[this.mode];

    return {
      facts: (rank) => this.slots.at(rank).facts,
      headLength: headLength(stored, context, this.mode),
      keptBefore: (rank) => {
        const before = this.slots.sumBefore(rank, kept);

        return before === 0 ? -1 : this.slots.search(kept, before - 1, false);
      },
      related: (key) => ({
        followers: ranksOf(this.followers.get(key)),
        joiners: ranksOf(this.joiners.get(key)),
      }),
    };
  }

  private replace(
    fromA: number,
    toA: number,
    slots: readonly BlockSlot[],
    context: RunContext
  ) {
    return this.project(this.splice(fromA, toA, slots), context);
  }

  private splice(
    fromA: number,
    toA: number,
    slots: readonly BlockSlot[]
  ): OutputEdit {
    const edit = {
      blocks: blocksOf(slots),
      first: this.slots.sumBefore(fromA, OUTPUT_BLOCKS),
      last: this.slots.sumBefore(toA, OUTPUT_BLOCKS),
      shows: toA - fromA === 1 ? this.slots.at(fromA).shows : null,
      slots,
    };

    this.slots.forEach(fromA, toA, (slot) => this.relate(slot, false));
    this.slots.splice(fromA, toA - fromA, slots);
    for (const slot of slots) this.relate(slot, true);

    return edit;
  }

  private project(edit: OutputEdit, context: RunContext) {
    const { first, last, slots } = edit;
    const run = embeddedRun(edit);

    if (run) {
      const step =
        run.step.change?.embed(
          this.projected.length,
          this.projected.childPosition([], first) + 1
        ) ?? RootChange.empty(this.projected.length);

      this.projected = step.apply(this.projected);
      run.level.showAt(getDefined(this.projected.child(first)));

      return step;
    }

    const output = outputOf(slots);
    const from = this.projected.childPosition([], first);
    const diffed = () => {
      const shown = this.projected.nodes.slice(first, last);

      countLedgerWork('diffedNodes', nodesIn(shown) + nodesIn(output));

      return RootChange.between(
        DocumentIndex.fromIndexedNodes(shown),
        DocumentIndex.fromIndexedNodes(output),
        { isSetValued: context.isSetValued }
      ).embed(this.projected.length, from);
    };
    // An empty output is one deletion, which needs no diff.
    const step =
      output.length > 0
        ? diffed()
        : last > first
          ? RootChange.create(this.projected, {
              from,
              insert: PreparedTokenSlice.empty,
              to: this.projected.childPosition([], last),
            })
          : RootChange.empty(this.projected.length);

    this.projected = step.apply(this.projected);

    let at = first;

    for (const slot of slots) {
      if (isLevelRun(slot.run)) {
        slot.run.level.showAt(getDefined(this.projected.child(at)));
      }
      at += getDefined(slot.measures[OUTPUT_BLOCKS]);
    }

    return step;
  }

  protected settle(line: BlockLine, context: RunContext) {
    if (this.slots.size === 0) return null;

    const start = this.headRank(this.slots.size - 1);
    const last = this.slots.at(start);
    const need = this.fillOf(
      start,
      this.slots.total(OUTPUT_BLOCKS) -
        getDefined(last.measures[OUTPUT_BLOCKS]),
      context
    );

    if (last.run ? need === last.run.part.min : unmarkedFills(need)) {
      return null;
    }

    const spans = new Map<number, readonly Span[]>();

    for (let rank = start; rank < this.slots.size; rank += 1) {
      spans.set(rank, spansOf(line, rank));
    }

    return this.replace(
      start,
      this.slots.size,
      this.cut(start, this.slots.size, spans, context, {
        head: start === 0 && line.headLength > 0,
        min: () => need,
      }),
      context
    );
  }

  toProjected(position: number, assoc: -1 | 1) {
    if (!this.changed) return position;

    const rank = this.headRank(
      Math.min(
        this.slots.search(STORED_LENGTH, position, assoc < 0),
        this.slots.size - 1
      )
    );
    const { run } = this.slots.at(rank);
    const local = position - this.slots.sumBefore(rank, STORED_LENGTH);
    const start = this.slots.sumBefore(rank, OUTPUT_LENGTH);

    return run?.changed
      ? start + placesAt(run).toProjected(local, assoc)
      : start + local;
  }

  toStored(position: number, assoc: -1 | 1) {
    if (!this.changed) return position;

    const rank = this.headRank(
      Math.min(
        this.slots.search(OUTPUT_LENGTH, position, assoc < 0),
        this.slots.size - 1
      )
    );
    const { run } = this.slots.at(rank);
    const local = position - this.slots.sumBefore(rank, OUTPUT_LENGTH);
    const start = this.slots.sumBefore(rank, STORED_LENGTH);

    return run?.changed
      ? start + placesAt(run).toStored(local, assoc)
      : start + local;
  }

  hides(position: number) {
    if (!this.changed) return false;

    const rank = this.slots.search(STORED_LENGTH, position, false);

    if (rank >= this.slots.size) return false;

    const head = this.headRank(rank);
    const { run } = this.slots.at(head);
    const before = position - this.slots.sumBefore(head, STORED_LENGTH);

    if (!run?.changed) return false;

    const places = placesAt(run);

    // The composed change merges two adjacent deletions, so a point between
    // two runs that each delete there is inside one deletion.
    if (before === 0 && head > 0 && places.deletesAtStart()) {
      const back = this.slots.at(this.headRank(head - 1)).run;

      return back?.changed
        ? placesAt(back).deletesAtEnd(back.storedLength)
        : false;
    }

    return places.hides(before);
  }

  added(position: number) {
    if (!this.changed) return null;

    const rank = this.slots.search(OUTPUT_LENGTH, position, false);

    if (rank >= this.slots.size) return null;

    const head = this.headRank(rank);
    const { run } = this.slots.at(head);
    const start = this.slots.sumBefore(head, OUTPUT_LENGTH);
    const local = position - start;
    const places = run?.changed ? placesAt(run) : null;

    if (local === 0 && head > 0 && places && places.insertsAtEdge(false) > 0) {
      const back = this.slots.at(this.headRank(head - 1)).run;
      const trailing = back?.changed ? placesAt(back).insertsAtEdge(true) : 0;

      if (trailing > 0) {
        return {
          from: start - trailing,
          to: start + places.insertsAtEdge(false),
        };
      }
    }

    const span = places?.added(local);

    return span ? { from: start + span.from, to: start + span.to } : null;
  }

  /**
   * The stored ranges the projected range `from` to `to` shows, with the
   * content it hides inside the blocks it shows, in the order it shows them,
   * and each block it hides whole that collapses into a block inside it.
   * With `wholeContainer`, the range reads the list's whole container, so it
   * also takes each block hidden whole that collapses between the list's
   * blocks, a run that shows nothing included.
   */
  spans(
    from: number,
    to: number,
    wholeContainer = false
  ): Array<readonly [number, number]> {
    if (!this.changed) return from < to ? [[from, to]] : [];

    const spans: Array<[number, number]> = [];
    const until = wholeContainer ? Number.POSITIVE_INFINITY : to;
    const push = (first: number, last: number) => {
      const previous = spans.at(-1);

      if (previous?.[1] === first) previous[1] = last;
      else spans.push([first, last]);
    };

    for (
      let rank = wholeContainer
        ? 0
        : this.headRank(
            Math.min(
              this.slots.search(OUTPUT_LENGTH, from, false),
              this.slots.size - 1
            )
          );
      rank < this.slots.size &&
      this.slots.sumBefore(rank, OUTPUT_LENGTH) < until;
    ) {
      countLedgerWork('spanSlots');

      const slot = this.slots.at(rank);
      const { run } = slot;
      const stored = this.slots.sumBefore(rank, STORED_LENGTH);
      const output = this.slots.sumBefore(rank, OUTPUT_LENGTH);
      const unchanged = run?.changed ? null : this.unchangedFrom(rank);

      if (unchanged) {
        const head = Math.max(from, output);
        const tail = Math.min(to, output + unchanged.length);

        if (head < tail) push(stored + head - output, stored + tail - output);
        rank = unchanged.end;
        continue;
      }

      const length = run
        ? run.outputLength
        : getDefined(slot.measures[OUTPUT_LENGTH]);
      const head = Math.max(from, output) - output;
      const tail = Math.min(to, output + length) - output;

      rank = this.endOf(rank);
      if (head >= tail && !(wholeContainer && run?.changed)) continue;

      for (const [first, last] of run?.changed
        ? isLevelRun(run)
          ? run.places.spans(head, tail)
          : placesOf(run).spans(head, tail, wholeContainer)
        : [[head, tail] as const]) {
        push(stored + first, stored + last);
      }
    }

    return spans;
  }

  /**
   * The slots from `rank` up to the next changed run, and their output
   * length, when none of them is pending and they show what they store.
   */
  private unchangedFrom(rank: number) {
    const end = this.slots.search(
      CHANGED_RUNS,
      this.slots.sumBefore(rank, CHANGED_RUNS),
      false
    );
    const sum = (measure: number) =>
      this.slots.sumBefore(end, measure) - this.slots.sumBefore(rank, measure);
    const length = sum(OUTPUT_LENGTH);

    return sum(PENDING) === 0 && sum(STORED_LENGTH) === length
      ? { end, length }
      : null;
  }

  /**
   * Whether the projection takes away the stored token at `position`, such
   * as the open of an element it unwraps or merges.
   */
  dissolves(position: number) {
    if (!this.changed) return false;

    const rank = this.headRank(
      Math.min(
        this.slots.search(STORED_LENGTH, position, false),
        this.slots.size - 1
      )
    );
    const { run } = this.slots.at(rank);

    return run?.changed
      ? placesAt(run).dissolves(
          position - this.slots.sumBefore(rank, STORED_LENGTH)
        )
      : false;
  }

  /** Whether any run shows stored content away from its stored place. */
  get reorders() {
    return this.slots.total(ORDERED_RUNS) > 0;
  }

  /**
   * Each place in the projected range `from` to `to`, ends included, where
   * the projection shows two neighbors that stand apart in storage, in
   * projected order.
   */
  breaks(from: number, to: number): ProjectionBreak[] {
    const breaks: ProjectionBreak[] = [];

    for (const { output, run, stored } of this.orderedRunsIn(from, to)) {
      for (const local of placesAt(run).breaks(from - output, to - output)) {
        const at = output + local.at;
        const before = stored + local.before;
        const after = stored + local.after;
        const last = breaks.at(-1);

        if (last?.at !== at || last.before !== before || last.after !== after) {
          breaks.push({ after, at, before });
        }
      }
    }

    return breaks;
  }

  /**
   * The stored and projected spans of each run with an order. Only the
   * recording laws read it, to tell the places inside those runs apart.
   */
  orderedSpans(): OrderedSpan[] {
    const spans: OrderedSpan[] = [];

    for (const { output, run, stored } of this.orderedRunsIn(0, Infinity)) {
      if (!isLevelRun(run)) {
        spans.push({
          output: [output, output + run.outputLength],
          stored: [stored, stored + run.storedLength],
        });
        continue;
      }
      for (const inner of run.level.orderedSpans()) {
        spans.push({
          output: [output + 1 + inner.output[0], output + 1 + inner.output[1]],
          stored: [stored + 1 + inner.stored[0], stored + 1 + inner.stored[1]],
        });
      }
    }

    return spans;
  }

  /**
   * The runs with an order whose output meets `from` to `to`.
   *
   * @yields {OrderedRunAt} Each run with its stored and projected starts.
   */
  private *orderedRunsIn(from: number, to: number): Generator<OrderedRunAt> {
    const count = this.slots.total(ORDERED_RUNS);

    if (count === 0) return;

    const first = this.headRank(
      Math.min(
        this.slots.search(OUTPUT_LENGTH, from, true),
        this.slots.size - 1
      )
    );

    for (
      let index = this.slots.sumBefore(first, ORDERED_RUNS);
      index < count;
      index += 1
    ) {
      const rank = this.slots.search(ORDERED_RUNS, index, false);
      const output = this.slots.sumBefore(rank, OUTPUT_LENGTH);

      if (output > to) return;
      countLedgerWork('breakRuns');
      yield {
        output,
        rank,
        run: getDefined(this.slots.at(rank).run),
        stored: this.slots.sumBefore(rank, STORED_LENGTH),
      };
    }
  }

  /**
   * The stored subtrees the runs show away from their stored place, each by
   * its stored path.
   */
  moved(): Array<readonly number[]> {
    const paths: Array<readonly number[]> = [];

    for (const { rank, run } of this.orderedRunsIn(0, Infinity)) {
      if (isLevelRun(run)) {
        for (const path of run.level.moved()) paths.push([rank, ...path]);
        continue;
      }

      const moved = new Set(run.order?.moved);
      const walk = (node: JsonNode, path: readonly number[]) => {
        if (moved.has(node)) {
          paths.push(path);
        } else {
          (node.children ?? []).forEach((child, index) => {
            if (typeof child.text !== 'string') walk(child, [...path, index]);
          });
        }
      };

      run.nodes.forEach((node, index) => walk(node, [rank + index]));
    }

    return paths;
  }

  /**
   * Where the stored range `low` to `high` places: over the whole projection
   * when it runs from the first stored point to the last, else with each end
   * mapped on its own toward the inside. It has no place when its letters
   * show only outside an image that runs backward or holds nothing, and none
   * faithful where it meets a run whose places were diffed.
   */
  projectRange(low: number, high: number): RangePlacement {
    const first = this.stored.pointAt(0, 1);
    const last = this.stored.pointAt(this.stored.length, -1);

    if (
      low < high &&
      first &&
      last &&
      low <= this.stored.positionAt(first) &&
      high >= this.stored.positionAt(last)
    ) {
      return { from: 0, kind: 'placed', to: this.slots.total(OUTPUT_LENGTH) };
    }

    const from = this.toProjected(low, 1);
    const to = low === high ? from : this.toProjected(high, -1);

    if (!this.reorders) return { from, kind: 'placed', to };
    if (!this.alignedIn(from, to)) {
      return { kind: 'refused', reason: 'unaligned' };
    }
    if (from >= to && this.showsLetterIn(low, high)) {
      return { kind: 'refused', reason: 'crosses' };
    }

    return { from, kind: 'placed', to };
  }

  /** @internal */
  alignedIn(from: number, to: number): boolean {
    for (const { output, run } of this.orderedRunsIn(
      Math.min(from, to),
      Math.max(from, to)
    )) {
      const aligned = isLevelRun(run)
        ? run.places.alignedIn(from - output, to - output)
        : placesOf(run).aligned;

      if (!aligned) return false;
    }

    return true;
  }

  /** Whether the stored range `low` to `high` holds a letter the projection shows. */
  private showsLetterIn(low: number, high: number) {
    if (low >= high) return false;

    return this.stored
      .slice(low, high)
      .tokens.some(
        (token, index) =>
          token.kind === 'text' &&
          this.toProjected(low + index, 1) <
            this.toProjected(low + index + 1, -1)
      );
  }

  /**
   * The smallest projected range holding every block that reads the stored
   * content from `low` to `high`: the projected content between its ends,
   * widened to all of it each run shows elsewhere and to the line each block
   * hidden whole there collapses into.
   */
  readers(low: number, high: number): readonly [number, number] {
    const head = this.toProjected(low, 1);
    const tail = this.toProjected(high, -1);
    let from = Math.min(head, tail);
    let to = Math.max(head, tail);

    if (!this.changed) return [from, to];

    for (
      let rank = this.headRank(
        Math.min(
          this.slots.search(STORED_LENGTH, low, false),
          this.slots.size - 1
        )
      );
      rank < this.slots.size &&
      this.slots.sumBefore(rank, STORED_LENGTH) < high;
      rank = this.endOf(rank)
    ) {
      const { run } = this.slots.at(rank);

      if (!run?.changed) continue;

      const stored = this.slots.sumBefore(rank, STORED_LENGTH);
      const output = this.slots.sumBefore(rank, OUTPUT_LENGTH);
      const [first, last] = placesAt(run).readers(
        Math.max(low, stored) - stored,
        Math.min(high, stored + run.storedLength) - stored
      );

      from = Math.min(from, output + first);
      to = Math.max(to, output + last);
    }

    return [from, to];
  }

  composedChange() {
    countLedgerWork('composedChanges');

    return this.changeOfRuns();
  }

  private changeOfRuns() {
    const sections: number[] = [];
    const data: SectionData[] = [];
    let at = 0;

    for (let count = 0; count < this.slots.total(CHANGED_RUNS); count += 1) {
      const rank = this.slots.search(CHANGED_RUNS, count, false);
      const change = getDefined(this.slots.at(rank).run?.change);
      const start = this.slots.sumBefore(rank, STORED_LENGTH);

      addSection(sections, data, start - at, -1, null);
      for (let index = 0; index < change.sections.length; index += 2) {
        countCoreWork('sectionsWalked');
        addSection(
          sections,
          data,
          getDefined(change.sections[index]),
          getDefined(change.sections[index + 1]),
          change.data[index / 2]
        );
      }
      at = start + change.length;
    }
    addSection(sections, data, this.stored.length - at, -1, null);

    return RootChange.fromSections(sections, data);
  }

  protected headRank(rank: number) {
    return rank - this.slots.at(rank).offset;
  }

  private startOf(rank: number) {
    let start = this.headRank(rank);

    while (
      start > 0 &&
      isPending(this.slots.at(start)) &&
      isPending(this.slots.at(start - 1))
    ) {
      start -= 1;
    }

    return start;
  }

  protected endOf(rank: number) {
    const slot = this.slots.at(rank);

    if (slot.run) return this.headRank(rank) + slot.run.nodes.length;

    let end = rank + 1;

    while (
      isPending(slot) &&
      end < this.slots.size &&
      isPending(this.slots.at(end))
    ) {
      end += 1;
    }

    return end;
  }

  protected build(stored: DocumentIndex, context: RunContext) {
    this.depth = context.site?.length ?? 0;
    if (this.depth === 0) countLedgerWork('rebuilds');
    this.deleters.clear();
    this.followers.clear();
    this.joiners.clear();
    this.held = null;
    this.shown = null;
    this.stored = stored;
    this.slots = new SlotTree<BlockSlot>(MEASURES);
    this.wait(0, 0, stored, 0, stored.size, context, false);

    const line = this.lineOf(stored, context);
    let slots: BlockSlot[] = [];

    if (this.slots.size > 0) {
      const { from, spans, to } = this.closedWindow(0, line);

      slots = this.cut(from, to, spans, context, {
        head: line.headLength > 0,
        min: this.endingMin(from, to, context),
      });
    }
    this.deleters.clear();
    this.followers.clear();
    this.joiners.clear();
    this.slots = new SlotTree<BlockSlot>(MEASURES, slots);
    for (const slot of slots) this.relate(slot, true);
    this.projected = DocumentIndex.fromIndexedNodes(outputOf(slots));
    this.settle(line, context);
  }

  private relate(slot: BlockSlot, add: boolean) {
    for (const [keys, index] of [
      [slot.facts.deletes, this.deleters],
      [slot.facts.follows, this.followers],
      [slot.facts.joins, this.joiners],
    ] as const) {
      for (const key of keys) {
        const slots = index.get(key) ?? new Set<BlockSlot>();

        if (add) slots.add(slot);
        else slots.delete(slot);
        if (slots.size === 0) index.delete(key);
        else index.set(key, slots);
      }
    }
  }
}

// A window can reach back over the output of one resolved before it, so the
// two make one window, whose container no longer stands alone.
const record = (windows: ResolvedWindow[], edit: OutputEdit) => {
  const run = edit.slots.length === 1 ? (edit.slots[0]?.run ?? null) : null;
  let { first } = edit;
  let end = edit.first + edit.blocks;
  let inner = isLevelRun(run) ? run.step.windows : null;

  for (let back = windows.at(-1); back && back.end > edit.first;) {
    windows.pop();
    first = Math.min(first, back.first);
    if (back.end > edit.last) {
      end = Math.max(end, back.end + edit.blocks - edit.last + edit.first);
    }
    inner = null;
    back = windows.at(-1);
  }
  windows.push({ end, first, inner });
};

// A lone block that shows a container through the level it already showed
// takes the level's change to its children.
const embeddedRun = ({ last, first, shows, slots }: OutputEdit) => {
  const [lone] = slots;

  return slots.length === 1 &&
    last - first === 1 &&
    lone &&
    isLevelRun(lone.run) &&
    shows === lone.level
    ? lone.run
    : null;
};
