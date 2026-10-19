import { DocumentIndex } from '../../core/change/document-index';
import {
  addSection,
  mapRootChangePositionBackward,
  RootChange,
  type SectionData,
} from '../../core/change/root-change';
import { type JsonNode, PreparedTokenSlice } from '../../core/change/tokens';
import type { ProjectionBreak } from '../../core/command-document';
import type { ChangedRange } from '../../core/measured-sequence';
import { countCoreWork } from '../../core/work';
import { getDefined } from '../../internal/get-defined';
import type { AuthoredFormatProjection } from '../format';
import { tokenLength } from '../tree/alignment';
import type { AuthoredResolveSchema } from '../tree/resolve';
import { type BlockLine, type Span, spansOf } from './links';
import {
  type BlockFacts,
  canOrder,
  blockFactsOf,
  type Run,
  type RunContext,
  removedRun,
  removesBlock,
  resolveRun,
  writtenRun,
} from './runs';
import { type Slot, SlotTree } from './slots';
import { countLedgerWork } from './work';

const STORED_LENGTH = 0;
const OUTPUT_LENGTH = 1;
const OUTPUT_BLOCKS = 2;
const CHANGED_RUNS = 3;
const KEPT_LINES = 4;
const PENDING = 5;
const ORDERED_RUNS = 6;
const MEASURES = 7;

type BlockSlot = Slot & {
  facts: BlockFacts;
  node: JsonNode;
  offset: number;
  run: Run | null;
};

const measuresOf = (
  node: JsonNode,
  facts: BlockFacts,
  mode: AuthoredFormatProjection,
  {
    blocks = 0,
    changed = false,
    length = 0,
    pending = false,
    ordered = false,
  }: Readonly<{
    blocks?: number;
    changed?: boolean;
    length?: number;
    pending?: boolean;
    ordered?: boolean;
  }>
) => [
  tokenLength(node),
  length,
  blocks,
  changed ? 1 : 0,
  facts.keepsLine[mode] ? 1 : 0,
  pending ? 1 : 0,
  ordered ? 1 : 0,
];

const isPending = (slot: BlockSlot) => slot.measures[PENDING] === 1;

const pendingOf = (
  nodes: readonly JsonNode[],
  mode: AuthoredFormatProjection,
  replaced: Readonly<{ blocks: number; length: number }>
) =>
  nodes.map((node, index): BlockSlot => {
    const facts = blockFactsOf(node);

    return {
      facts,
      leaf: null,
      measures: measuresOf(node, facts, mode, {
        ...(index === 0 ? replaced : {}),
        pending: true,
      }),
      node,
      offset: 0,
      run: null,
    };
  });

// Projected blocks `first` to `last` give way to `output`.
type OutputEdit = Readonly<{
  first: number;
  last: number;
  output: readonly JsonNode[];
}>;

/**
 * What a frame's commands wrote in a root: the projection of the stored root
 * its recording left, and the change to it from the projection they decided
 * on.
 */
export type WrittenRoot = Readonly<{
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

const unmarkedSlot = (
  { facts, node }: BlockSlot,
  mode: AuthoredFormatProjection
): BlockSlot => ({
  facts,
  leaf: null,
  measures: measuresOf(node, facts, mode, {
    blocks: 1,
    length: tokenLength(node),
  }),
  node,
  offset: 0,
  run: null,
});

const runSlots = (
  group: readonly BlockSlot[],
  run: Run,
  mode: AuthoredFormatProjection
) =>
  group.map(({ facts, node }, offset): BlockSlot => ({
    facts,
    leaf: null,
    measures: measuresOf(
      node,
      facts,
      mode,
      offset === 0
        ? {
            blocks: run.output.length,
            changed: run.changed,
            length: run.outputLength,
            ordered: canOrder(run.nodes, mode),
          }
        : {}
    ),
    node,
    offset,
    run,
  }));

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

const resolveWindow = (
  window: readonly BlockSlot[],
  joinsPrevious: Uint8Array,
  context: RunContext,
  cache: WeakMap<JsonNode, Run>,
  part: WindowPart
) => {
  const slots: BlockSlot[] = [];
  const groups = groupsOf(window, joinsPrevious);
  let blocks = 0;

  for (const [rank, group] of groups.entries()) {
    const first = getDefined(group[0]);
    const index = slots.length;
    const min = rank === groups.length - 1 ? part.min(blocks, index) : 0;
    const head = index === 0 && part.head;

    if (isUnmarked(group) && unmarkedFills(min)) {
      slots.push(unmarkedSlot(first, context.mode));
      blocks += 1;
      continue;
    }

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

    slots.push(...runSlots(group, run, context.mode));
    blocks += run.output.length;
  }
  countLedgerWork('windowSlots', slots.length);

  return slots;
};

/**
 * The window's slots when the frame's commands wrote its `output`: unmarked
 * blocks stay themselves, and the window's one other group takes the rest of
 * the output, so no kernel runs. Null when the window holds no such group or
 * more than one, when the output does not fit around its unmarked blocks, or
 * when an unmarked block ends the window with more than one block of the
 * root's minimum to fill.
 */
const writtenWindow = (
  window: readonly BlockSlot[],
  joinsPrevious: Uint8Array,
  context: RunContext,
  cache: WeakMap<JsonNode, Run>,
  part: WindowPart,
  output: readonly JsonNode[]
) => {
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
    ...ahead.map((slot) => unmarkedSlot(slot, context.mode)),
    ...runSlots(group, run, context.mode),
    ...behind.map((slot) => unmarkedSlot(slot, context.mode)),
  ];

  countLedgerWork('windowSlots', slots.length);

  return slots;
};

const REMOVAL = 0;
const startsWithRemoval = (change: RootChange) =>
  change.sections[1] === REMOVAL;
const endsWithRemoval = (change: RootChange) =>
  change.sections.at(-1) === REMOVAL;

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

const edgeInsertion = (run: Run | null, end: boolean) => {
  if (run?.order) return run.order.edgeInsertion(end);
  const sections = run?.change?.sections ?? [];
  const pair = end ? sections.length - 2 : 0;

  return pair >= 0 && sections[pair] === 0 && getDefined(sections[pair + 1]) > 0
    ? getDefined(sections[pair + 1])
    : 0;
};

const contentOf = (context: RunContext) =>
  context.schema?.content(null, context.root) ?? null;

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

const compose = (composed: RootChange | null, step: RootChange | null) =>
  composed && step ? composed.compose(step) : (composed ?? step);

const sharesNothing = (
  ranges: readonly ChangedRange[],
  before: DocumentIndex,
  after: DocumentIndex
) => {
  const [whole] = ranges;

  return (
    ranges.length === 1 &&
    whole?.[0] === 0 &&
    whole[1] === before.size &&
    before.size > 1 &&
    after.size > 1
  );
};

/** @internal */
export class RootProjection {
  private cache = new WeakMap<JsonNode, Run>();
  private readonly followers = new Map<string, Set<BlockSlot>>();
  private readonly joiners = new Map<string, Set<BlockSlot>>();
  private projected!: DocumentIndex;
  private schema: AuthoredResolveSchema | null;
  private slots!: SlotTree<BlockSlot>;
  private stored!: DocumentIndex;

  readonly mode: AuthoredFormatProjection;

  constructor(
    mode: AuthoredFormatProjection,
    stored: DocumentIndex,
    context: RunContext
  ) {
    this.mode = mode;
    this.schema = context.schema;
    this.build(stored, context);
    this.publish(null, null);
  }

  get changed() {
    return this.slots.total(CHANGED_RUNS) > 0;
  }

  get previewRoot() {
    return this.projected;
  }

  /** Take `index`, a root with this projection's content, as its index. */
  adopt(index: DocumentIndex) {
    this.projected = index;
  }

  /**
   * Move to `stored`, resolving again the runs a verdict changed at
   * `touched`, in `stored`'s ranks, and every run when the schema changed.
   * Given `written`, what a frame's commands wrote in this root, a lone
   * pending window takes its slice of that root instead of resolving.
   * Returns the change from the previous index, or null when the content
   * did not move.
   */
  sync(
    stored: DocumentIndex,
    context: RunContext,
    touched: readonly number[] = [],
    written: WrittenRoot | null = null
  ): RootChange | null {
    const from = this.projected;
    let change: RootChange | null;

    if (context.schema === this.schema) {
      const ranges = this.stored.changedChildren(stored);

      if (ranges.length === 0 && touched.length === 0) {
        this.stored = stored;
        return null;
      }
      change = this.apply(ranges, stored, context, touched, written);
    } else {
      this.schema = context.schema;
      this.cache = new WeakMap();
      this.build(stored, context);
      change = RootChange.between(from, this.projected);
    }
    return this.publish(from, change);
  }

  private publish(from: DocumentIndex | null, change: RootChange | null) {
    if (from && (!change || change.empty)) {
      this.projected = from;
      return null;
    }
    if (!this.changed) this.projected = this.stored;

    return change;
  }

  private apply(
    ranges: readonly ChangedRange[],
    stored: DocumentIndex,
    context: RunContext,
    touched: readonly number[],
    written: WrittenRoot | null
  ): RootChange | null {
    const from = this.projected;

    if (sharesNothing(ranges, this.stored, stored)) {
      this.build(stored, context);

      return RootChange.between(from, this.projected);
    }

    const pended = this.pend(ranges, stored, context);

    this.stored = stored;
    for (const rank of touched) this.pendRun(rank);

    const line = this.lineOf(stored, context);

    // Once `pend` projects a deletion, the projected root may no longer be
    // the one the commands decided on.
    return compose(
      compose(
        pended,
        this.resolvePending(line, context, pended ? null : written)
      ),
      this.settle(line, context)
    );
  }

  private pend(
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

      const nodes: JsonNode[] = [];

      for (let rank = fromB; rank < toB; rank += 1) {
        nodes.push(getDefined(stored.child(rank)));
      }
      if (nodes.length === 0) {
        composed = compose(composed, this.replace(fromA, toA, [], context));
      } else {
        this.wait(fromA, toA, nodes);
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

  private pendRun(rank: number) {
    if (isPending(this.slots.at(rank))) return;

    const from = this.headRank(rank);
    const to = this.endOf(rank);
    const nodes: JsonNode[] = [];

    this.slots.forEach(from, to, (slot) => {
      nodes.push(slot.node);
    });
    this.wait(from, to, nodes);
  }

  private wait(from: number, to: number, nodes: readonly JsonNode[]) {
    const slots = pendingOf(nodes, this.mode, {
      blocks:
        this.slots.sumBefore(to, OUTPUT_BLOCKS) -
        this.slots.sumBefore(from, OUTPUT_BLOCKS),
      length:
        this.slots.sumBefore(to, OUTPUT_LENGTH) -
        this.slots.sumBefore(from, OUTPUT_LENGTH),
    });

    this.slots.forEach(from, to, (slot) => this.relate(slot, false));
    this.slots.splice(from, to - from, slots);
    for (const slot of slots) this.relate(slot, true);
  }

  // Windows whose output meets, such as two that only blocks the mode removes
  // keep apart, project in one step, so the root's index is rebuilt once for
  // them.
  private resolvePending(
    line: BlockLine,
    context: RunContext,
    written: WrittenRoot | null
  ) {
    let composed: RootChange | null = null;
    let batch: OutputEdit | null = null;
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

      // One window holds all the pending blocks, so the written root holds
      // its output where its old output was.
      if (
        written &&
        !batch &&
        this.slots.sumBefore(to, PENDING) -
          this.slots.sumBefore(from, PENDING) ===
          this.slots.total(PENDING)
      ) {
        const output = this.writtenOutput(written, from, to);
        const slots =
          output &&
          writtenWindow(
            window,
            joinsPrevious,
            context,
            this.cache,
            part,
            output
          );

        if (slots) {
          this.splice(from, to, slots);
          this.projected = written.index;

          return written.change;
        }
      }

      const edit = this.splice(
        from,
        to,
        resolveWindow(window, joinsPrevious, context, this.cache, part)
      );

      if (batch && edit.first === batch.first + batch.output.length) {
        batch = {
          first: batch.first,
          last: batch.last + edit.last - edit.first,
          output: [...batch.output, ...edit.output],
        };
      } else {
        flush();
        batch = edit;
      }
    }
    flush();

    return composed;
  }

  private writtenOutput(
    { change, index }: WrittenRoot,
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

  // A window that ends the root gives its last run the minimum the blocks
  // before that run leave, so `settle` need not resolve the run again. While
  // the root's prefix still lies in the window's output, `settle` decides.
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

  // The kernel fills a root's minimum at its end, so the run that starts at
  // `start` and ends the root fills what the `before` blocks ahead of it
  // leave. It completes nothing in a root whose prefix holds a block that
  // fits no prefix slot, so a run that does not start the root fills no
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

  // Read from the slots, which hold every window's output before the
  // projected root takes the batch.
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

  private lineOf(stored: DocumentIndex, context: RunContext): BlockLine {
    const ranksOf = (slots: ReadonlySet<BlockSlot> | undefined) =>
      [...(slots ?? [])].map((slot) => this.slots.rankOf(slot));

    return {
      facts: (rank) => this.slots.at(rank).facts,
      headLength: headLength(stored, context, this.mode),
      keptBefore: (rank) => {
        const kept = this.slots.sumBefore(rank, KEPT_LINES);

        return kept === 0 ? -1 : this.slots.search(KEPT_LINES, kept - 1, false);
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
      first: this.slots.sumBefore(fromA, OUTPUT_BLOCKS),
      last: this.slots.sumBefore(toA, OUTPUT_BLOCKS),
      output: outputOf(slots),
    };

    this.slots.forEach(fromA, toA, (slot) => this.relate(slot, false));
    this.slots.splice(fromA, toA - fromA, slots);
    for (const slot of slots) this.relate(slot, true);

    return edit;
  }

  private project({ first, last, output }: OutputEdit, context: RunContext) {
    const from = this.projected.childPosition([], first);
    // An empty output is one deletion, which needs no diff.
    const step =
      output.length > 0
        ? RootChange.between(
            DocumentIndex.fromIndexedNodes(
              this.projected.nodes.slice(first, last)
            ),
            DocumentIndex.fromIndexedNodes(output),
            { isSetValued: context.isSetValued }
          ).embed(this.projected.length, from)
        : last > first
          ? RootChange.create(this.projected, {
              from,
              insert: PreparedTokenSlice.empty,
              to: this.projected.childPosition([], last),
            })
          : RootChange.empty(this.projected.length);

    this.projected = step.apply(this.projected);

    return step;
  }

  private settle(line: BlockLine, context: RunContext) {
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
    const slot = this.slots.at(rank);
    const local = position - this.slots.sumBefore(rank, STORED_LENGTH);
    const start = this.slots.sumBefore(rank, OUTPUT_LENGTH);

    if (slot.run?.order) {
      return start + slot.run.order.toProjected(local, assoc);
    }

    return slot.run?.change
      ? start + getDefined(slot.run.change.mapPos(local, assoc))
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
    const slot = this.slots.at(rank);
    const local = position - this.slots.sumBefore(rank, OUTPUT_LENGTH);
    const start = this.slots.sumBefore(rank, STORED_LENGTH);

    if (slot.run?.order) return start + slot.run.order.toStored(local, assoc);

    return slot.run?.change
      ? start +
          getDefined(
            mapRootChangePositionBackward(slot.run.change, local, assoc)
          )
      : start + local;
  }

  hides(position: number) {
    if (!this.changed) return false;

    const rank = this.slots.search(STORED_LENGTH, position, false);

    if (rank >= this.slots.size) return false;

    const head = this.headRank(rank);
    const { run } = this.slots.at(head);
    const start = this.slots.sumBefore(head, STORED_LENGTH);

    if (run?.order) return run.order.hides(position - start);
    if (position === start && this.joinsPreviousRemoval(head, start)) {
      return true;
    }

    const change = run?.change;
    let before = position - start;

    if (!change) return false;
    for (let pair = 0; pair < change.sections.length; pair += 2) {
      const length = getDefined(change.sections[pair]);

      if (
        getDefined(change.sections[pair + 1]) >= 0 &&
        before > 0 &&
        before < length
      ) {
        return true;
      }
      before -= length;
      if (before < 0) return false;
    }

    return false;
  }

  breaks(from: number, to: number): readonly ProjectionBreak[] {
    const count = this.slots.total(ORDERED_RUNS);

    if (count === 0) return [];
    const breaks: ProjectionBreak[] = [];
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
      const projected = this.slots.sumBefore(rank, OUTPUT_LENGTH);
      if (projected > to) break;
      countLedgerWork('breakRuns');
      const stored = this.slots.sumBefore(rank, STORED_LENGTH);
      const order = this.slots.at(rank).run?.order;

      for (const entry of order?.breaks ?? []) {
        const at = projected + entry.at;
        if (from <= at && at <= to) {
          breaks.push({
            at,
            before: stored + entry.before,
            after: stored + entry.after,
          });
        }
      }
    }
    return breaks;
  }

  added(position: number) {
    if (!this.changed) return null;

    const rank = this.slots.search(OUTPUT_LENGTH, position, false);
    if (rank >= this.slots.size) return null;

    const head = this.headRank(rank);
    const { run } = this.slots.at(head);
    const start = this.slots.sumBefore(head, OUTPUT_LENGTH);
    const local = position - start;
    const leading = edgeInsertion(run, false);

    if (local === 0 && head > 0 && leading > 0) {
      const previous = this.headRank(head - 1);
      const trailing = edgeInsertion(this.slots.at(previous).run, true);

      if (trailing > 0) return { from: start - trailing, to: start + leading };
    }
    if (run?.order) {
      const added = run.order.added(local);
      return added ? { from: start + added.from, to: start + added.to } : null;
    }
    const change = run?.change;
    if (!change) return null;
    let after = 0;

    for (let pair = 0; pair < change.sections.length; pair += 2) {
      countCoreWork('sectionsWalked');
      const inserted = getDefined(change.sections[pair + 1]);
      const length =
        inserted < 0 ? getDefined(change.sections[pair]) : inserted;

      if (inserted > 0 && after < local && local < after + length) {
        return { from: start + after, to: start + after + length };
      }
      after += length;
      if (after > local) return null;
    }
    return null;
  }

  composedChange() {
    countLedgerWork('composedChanges');

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

  private headRank(rank: number) {
    return rank - this.slots.at(rank).offset;
  }

  private joinsPreviousRemoval(head: number, start: number) {
    const change = this.slots.at(head).run?.change;

    if (head === 0 || !change || !startsWithRemoval(change)) return false;

    const previous = this.headRank(head - 1);
    const before = this.slots.at(previous).run;

    return (
      !!before?.change &&
      !before.order &&
      endsWithRemoval(before.change) &&
      this.slots.sumBefore(previous, STORED_LENGTH) + before.change.length ===
        start
    );
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

  private endOf(rank: number) {
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

  private build(stored: DocumentIndex, context: RunContext) {
    countLedgerWork('rebuilds');
    this.followers.clear();
    this.joiners.clear();
    this.stored = stored;
    this.slots = new SlotTree<BlockSlot>(
      MEASURES,
      pendingOf(stored.nodes.slice(), this.mode, { blocks: 0, length: 0 })
    );
    this.slots.forEach(0, this.slots.size, (slot) => this.relate(slot, true));

    const line = this.lineOf(stored, context);
    let slots: BlockSlot[] = [];

    if (this.slots.size > 0) {
      const { from, spans, to } = this.closedWindow(0, line);

      slots = this.cut(from, to, spans, context, {
        head: line.headLength > 0,
        min: this.endingMin(from, to, context),
      });
    }
    this.followers.clear();
    this.joiners.clear();
    this.slots = new SlotTree<BlockSlot>(MEASURES, slots);
    for (const slot of slots) this.relate(slot, true);
    this.projected = DocumentIndex.fromIndexedNodes(outputOf(slots));
    this.settle(line, context);
  }

  private relate(slot: BlockSlot, add: boolean) {
    for (const [keys, index] of [
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
