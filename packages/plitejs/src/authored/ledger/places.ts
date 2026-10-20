import {
  mapRootChangePositionBackward,
  type RootChange,
} from '../../core/change/root-change';
import type { JsonNode } from '../../core/change/tokens';
import type { ProjectionBreak } from '../../core/command-document';
import { countCoreWork } from '../../core/work';
import { getDefined } from '../../internal/get-defined';
import { tokenLength } from '../tree/alignment';
import type { Run, RunOrder } from './runs';
import { countLedgerWork } from './work';

type Segment = Readonly<{ from: number; start: number; to: number }>;

type Range = readonly [number, number];

/** A stored block the output hides whole, with the output range of the shown block it collapses into. */
type Hidden = Readonly<{ from: number; owner: Range | null; to: number }>;

/** A run's hidden blocks, indexed so a place read visits only the ones near it. */
type HiddenIndex = Readonly<{
  /** By stored position. */
  blocks: readonly Hidden[];
  /** The stored ranges the blocks cover, merged, by stored position. */
  cut: readonly Range[];
  /** The blocks that collapse into a shown block, by that block's output start. */
  owned: ReadonlyArray<Hidden & Readonly<{ owner: Range }>>;
  ownerless: readonly Hidden[];
  /** The furthest stored end among each block of `blocks` and the blocks before it. */
  reach: readonly number[];
}>;

/** The first index of `list` where `before` stops holding, when it holds on a prefix. */
const firstAfter = <T>(list: readonly T[], before: (item: T) => boolean) => {
  let low = 0;
  let high = list.length;

  while (low < high) {
    const middle = (low + high) >> 1;

    if (before(getDefined(list[middle]))) low = middle + 1;
    else high = middle;
  }

  return low;
};

/**
 * The last segment of `list`, sorted by `edge`, that starts at or before
 * `position`, or the one before it when `position` is its start and `assoc`
 * leans back.
 */
const segmentAt = (
  list: readonly Segment[],
  edge: 'from' | 'start',
  position: number,
  assoc: -1 | 1
) => {
  const last = Math.max(
    0,
    firstAfter(list, (segment) => segment[edge] <= position) - 1
  );

  return getDefined(
    list[
      position === getDefined(list[last])[edge] && assoc < 0 && last > 0
        ? last - 1
        : last
    ]
  );
};

const rangeAt = (
  nodes: readonly JsonNode[],
  path: readonly number[]
): Range => {
  let level = nodes;
  let from = 0;

  for (const [depth, index] of path.entries()) {
    for (const node of level.slice(0, index)) from += tokenLength(node);

    const node = getDefined(level[index]);

    if (depth === path.length - 1) return [from, from + tokenLength(node)];
    from += 1;
    level = node.children ?? [];
  }

  return [from, from];
};

/** The output range of the innermost element strictly around `from` to `to`, or null. */
const around = (
  nodes: readonly JsonNode[],
  from: number,
  to: number
): Range | null => {
  let level = nodes;
  let index = 0;
  let start = 0;
  let found: Range | null = null;

  while (index < level.length && start <= from) {
    const node = getDefined(level[index]);
    const end = start + tokenLength(node);

    if (
      typeof node.text !== 'string' &&
      to <= end &&
      (start < from || to < end)
    ) {
      found = [start, end];
      level = node.children ?? [];
      index = 0;
      start += 1;
    } else {
      index += 1;
      start = end;
    }
  }

  return found;
};

const STARTS = new WeakMap<RootChange, readonly number[]>();

const startsOf = (change: RootChange) => {
  let starts = STARTS.get(change);

  if (!starts) {
    const list = [0];

    for (let pair = 0; pair < change.sections.length; pair += 2) {
      list.push(getDefined(list.at(-1)) + getDefined(change.sections[pair]));
    }
    starts = list;
    STARTS.set(change, starts);
  }

  return starts;
};

const sectionEndingAfter = (change: RootChange, at: number) => {
  const starts = startsOf(change);
  let low = 0;
  let high = starts.length - 1;

  while (low < high) {
    const middle = (low + high) >> 1;

    countCoreWork('sectionsWalked');
    if (getDefined(starts[middle + 1]) <= at) low = middle + 1;
    else high = middle;
  }

  return low;
};

/** The section of `change` holding the token at `at` of its input. */
const sectionAt = (change: RootChange, at: number) => {
  const section = sectionEndingAfter(change, at);

  return section * 2 < change.sections.length
    ? {
        inserted: getDefined(change.sections[section * 2 + 1]),
        start: getDefined(startsOf(change)[section]),
      }
    : null;
};

const edgeInsertion = (change: RootChange, end: boolean) => {
  const { sections } = change;
  const pair = end ? sections.length - 2 : 0;

  return pair >= 0 && sections[pair] === 0 && getDefined(sections[pair + 1]) > 0
    ? getDefined(sections[pair + 1])
    : 0;
};

const edgeDeletion = (change: RootChange, end: boolean) => {
  const { sections } = change;
  const pair = end ? sections.length - 2 : 0;

  return (
    pair >= 0 && getDefined(sections[pair]) > 0 && sections[pair + 1] === 0
  );
};

// Whether a position lies strictly inside content the change removes.
const hidesIn = (change: RootChange, position: number) => {
  let before = position;

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
};

/**
 * The places of one run: where each stored position shows in the run's
 * output and back. A run with an order shows some stored subtrees away from
 * their stored place, so its positions go through the order to the stored
 * content as the output shows it, which the alignment then pairs position
 * by position. Positions are local to the run.
 *
 * @internal
 */
export class RunPlaces {
  private readonly alignment: RootChange | null;
  /** The order's stored ranges, by stored position. */
  private readonly byStored: readonly Segment[];
  /** The same ranges, in the order the output shows them. */
  private readonly byShown: readonly Segment[];
  private readonly shownWithEnds: readonly Segment[];
  private readonly run: Run;
  private hiddenIndex: HiddenIndex | null = null;

  /** Whether the run's alignment paired its content; false when it was diffed. */
  readonly aligned: boolean;
  readonly order: RunOrder | null;

  constructor(run: Run) {
    this.alignment = run.alignment;
    this.aligned = run.aligned;
    this.order = run.order;
    this.run = run;

    let start = 0;
    const shown = (run.order?.segments ?? []).map(({ from, to }) => {
      const segment = { from, start, to };

      start += to - from;

      return segment;
    });

    this.byShown = shown;
    this.byStored = shown.toSorted((left, right) => left.from - right.from);
    this.shownWithEnds = [
      { from: 0, start: 0, to: 0 },
      ...shown,
      { from: run.storedLength, start: run.storedLength, to: run.storedLength },
    ];
  }

  /** The position in the stored content as the output shows it. */
  private shown(position: number, assoc: -1 | 1) {
    if (!this.order) return position;

    const segment = segmentAt(this.byStored, 'from', position, assoc);

    return segment.start + position - segment.from;
  }

  /** The stored position of a position in the stored content as the output shows it. */
  private stored(position: number, assoc: -1 | 1) {
    if (!this.order) return position;

    const segment = segmentAt(this.byShown, 'start', position, assoc);

    return segment.from + position - segment.start;
  }

  /** The output position of a position in the stored content as the output shows it. */
  private image(shownPosition: number, assoc: -1 | 1) {
    return this.alignment
      ? getDefined(this.alignment.mapPos(shownPosition, assoc))
      : shownPosition;
  }

  toProjected(position: number, assoc: -1 | 1) {
    const at = this.order ? this.outOfHidden(position, assoc) : position;

    return this.image(this.shown(at, assoc), assoc);
  }

  private outOfHidden(position: number, assoc: -1 | 1) {
    const { cut } = this.hidden;
    const range = cut[firstAfter(cut, ([, to]) => to <= position)];

    return range && range[0] < position ? range[assoc < 0 ? 0 : 1] : position;
  }

  toStored(position: number, assoc: -1 | 1) {
    const at = this.alignment
      ? getDefined(
          mapRootChangePositionBackward(this.alignment, position, assoc)
        )
      : position;

    return this.stored(at, assoc);
  }

  /**
   * Whether a stored position lies strictly inside content the output
   * removes. At a move edge it does when both its sides do.
   */
  hides(position: number) {
    const { alignment } = this;

    if (!alignment) return false;

    const before = this.shown(position, -1);
    const after = this.shown(position, 1);

    return hidesIn(alignment, before) && hidesIn(alignment, after);
  }

  /**
   * The output span of content the output inserts that strictly holds an
   * output position, or null.
   */
  added(position: number) {
    const { alignment } = this;

    if (!alignment) return null;

    let after = 0;

    for (let pair = 0; pair < alignment.sections.length; pair += 2) {
      countCoreWork('sectionsWalked');

      const inserted = getDefined(alignment.sections[pair + 1]);
      const length =
        inserted < 0 ? getDefined(alignment.sections[pair]) : inserted;

      if (inserted > 0 && after < position && position < after + length) {
        return { from: after, to: after + length };
      }
      after += length;
      if (after > position) return null;
    }

    return null;
  }

  /** Whether the output removes content right after the run's stored start. */
  deletesAtStart() {
    const { alignment } = this;

    if (!alignment) return false;
    if (!this.order) return edgeDeletion(alignment, false);

    return sectionAt(alignment, this.shown(0, 1))?.inserted === 0;
  }

  /** Whether the output removes content right before the run's stored end. */
  deletesAtEnd(length: number) {
    const { alignment } = this;

    if (!alignment) return false;
    if (!this.order) return edgeDeletion(alignment, true);

    const at = this.shown(length, -1);

    return at > 0 && sectionAt(alignment, at - 1)?.inserted === 0;
  }

  /** The length the output inserts at its start, or at its end. */
  insertsAtEdge(end: boolean) {
    return this.alignment ? edgeInsertion(this.alignment, end) : 0;
  }

  private get hidden() {
    if (this.hiddenIndex) return this.hiddenIndex;

    const blocks = (this.run.hidden ?? [])
      .map(({ at, owner }) => {
        const [from, to] = rangeAt(this.run.nodes, at);

        return { from, owner: owner && rangeAt(this.run.output, owner), to };
      })
      .toSorted((left, right) => left.from - right.from);
    const cut: Array<[number, number]> = [];
    const reach: number[] = [];

    for (const { from, to } of blocks) {
      const last = cut.at(-1);

      if (last && from <= last[1]) last[1] = Math.max(last[1], to);
      else cut.push([from, to]);
      reach.push(Math.max(reach.at(-1) ?? 0, to));
    }

    this.hiddenIndex = {
      blocks,
      cut,
      owned: blocks
        .filter((block): block is Hidden & { owner: Range } => !!block.owner)
        .toSorted((left, right) => left.owner[0] - right.owner[0]),
      ownerless: blocks.filter(({ owner }) => !owner),
      reach,
    };

    return this.hiddenIndex;
  }

  /**
   * The stored ranges an output range shows, with the content the output
   * hides inside the blocks it shows, in the order the output shows them,
   * then each block the output hides whole that collapses into a block
   * inside the range. With `wholeContainer`, the range reads the whole
   * container the run's blocks sit in, which a block that collapses between
   * them collapses into.
   */
  spans(
    from: number,
    to: number,
    wholeContainer = false
  ): Array<readonly [number, number]> {
    const spans = this.shownSpans(from, to);
    const { owned, ownerless } = this.hidden;
    const reads = new Set<Hidden>(
      spans.length === 0 ? this.collapsedAround(from, to) : []
    );

    for (
      let index = firstAfter(owned, ({ owner }) => owner[0] < from);
      index < owned.length;
      index += 1
    ) {
      const block = getDefined(owned[index]);

      countLedgerWork('hiddenBlocks');
      if (block.owner[0] > to) break;
      if (block.owner[1] <= to) reads.add(block);
    }
    if (wholeContainer) {
      countLedgerWork('hiddenBlocks', ownerless.length);
      for (const block of ownerless) reads.add(block);
    }
    for (const block of [...reads].toSorted(
      (left, right) => left.from - right.from
    )) {
      const previous = spans.at(-1);

      if (previous?.[1] === block.from) previous[1] = block.to;
      else spans.push([block.from, block.to]);
    }

    return spans;
  }

  private collapsedAround(from: number, to: number) {
    const element = around(this.run.output, from, to);
    const { owned } = this.hidden;
    const blocks: Hidden[] = [];

    if (!element) return blocks;
    for (
      let index = firstAfter(owned, ({ owner }) => owner[0] < element[0]);
      index < owned.length;
      index += 1
    ) {
      const block = getDefined(owned[index]);

      countLedgerWork('hiddenBlocks');
      if (block.owner[0] !== element[0]) break;
      if (block.owner[1] === element[1]) blocks.push(block);
    }

    return blocks;
  }

  /**
   * The stored ranges an output range shows, with the content the output
   * hides inside the blocks it shows, in the order the output shows them.
   */
  shownSpans(from: number, to: number): Array<[number, number]> {
    const start = this.alignment
      ? getDefined(mapRootChangePositionBackward(this.alignment, from, 1))
      : from;
    const end = this.alignment
      ? getDefined(mapRootChangePositionBackward(this.alignment, to, -1))
      : to;
    const segments = this.order
      ? this.byShown
      : [{ from: 0, start: 0, to: Number.POSITIVE_INFINITY }];
    const spans: Array<[number, number]> = [];
    const add = (first: number, next: number) => {
      const previous = spans.at(-1);

      if (previous?.[1] === first) previous[1] = next;
      else spans.push([first, next]);
    };

    for (
      let rank = firstAfter(
        segments,
        (segment) => segment.start + segment.to - segment.from <= start
      );
      rank < segments.length;
      rank += 1
    ) {
      const {
        from: stored,
        start: shown,
        to: last,
      } = getDefined(segments[rank]);

      countLedgerWork('orderSegments');
      if (shown >= end) break;

      const head = Math.max(start, shown);
      const tail = Math.min(end, shown + last - stored);

      if (head >= tail) continue;

      let at = stored + head - shown;
      const stop = stored + tail - shown;
      const { cut } = this.hidden;

      for (
        let index = firstAfter(cut, ([, cutEnd]) => cutEnd <= at);
        index < cut.length;
        index += 1
      ) {
        const [first, next] = getDefined(cut[index]);

        countLedgerWork('hiddenBlocks');
        if (first >= stop) break;
        if (first > at) add(at, first);
        at = next;
      }
      if (at < stop) add(at, stop);
    }

    return spans;
  }

  /**
   * Whether the output takes away the stored token at `position`, such as
   * the open of an element it unwraps or merges, or of one it removes.
   */
  dissolves(position: number) {
    const { alignment } = this;

    if (!alignment) return false;

    const section = sectionAt(alignment, this.shown(position, 1));

    return !!section && section.inserted >= 0;
  }

  /**
   * Each place in the output range `from` to `to`, ends included, where the
   * output shows two stored ranges side by side that stand apart in storage.
   * The run's start and end count as ranges of no length, so a run that
   * moves its first or last block breaks at its edge.
   */
  breaks(from: number, to: number): ProjectionBreak[] {
    if (!this.order) return [];

    const { shownWithEnds } = this;
    const breaks: ProjectionBreak[] = [];

    for (
      let index = Math.max(
        1,
        firstAfter(shownWithEnds, ({ start }) => this.image(start, -1) < from)
      );
      index < shownWithEnds.length;
      index += 1
    ) {
      const left = getDefined(shownWithEnds[index - 1]);
      const right = getDefined(shownWithEnds[index]);
      const at = this.image(right.start, -1);

      countLedgerWork('orderSegments');
      if (at > to) break;
      if (left.to !== right.from) {
        breaks.push({ after: right.from, at, before: left.to });
      }
    }

    return breaks;
  }

  /**
   * The smallest output range that shows the stored content from `from` to
   * `to`. Content the output hides shows nowhere, so it widens nothing.
   */
  private hull(from: number, to: number): readonly [number, number] {
    let low = Number.POSITIVE_INFINITY;
    let high = Number.NEGATIVE_INFINITY;

    for (
      let index = firstAfter(this.byStored, (segment) => segment.to <= from);
      index < this.byStored.length;
      index += 1
    ) {
      const segment = getDefined(this.byStored[index]);

      countLedgerWork('orderSegments');
      if (segment.from >= to) break;

      const head = Math.max(from, segment.from);
      const tail = Math.min(to, segment.to);
      const start = this.toProjected(head, 1);
      const end = this.toProjected(tail, -1);

      if (head < tail && start < end) {
        low = Math.min(low, start);
        high = Math.max(high, end);
      }
    }

    return low < high
      ? [low, high]
      : [this.toProjected(from, 1), this.toProjected(to, -1)];
  }

  /**
   * The smallest output range holding every block that reads the stored
   * content from `from` to `to`: its hull, widened to the line each block
   * hidden whole there collapses into.
   */
  readers(from: number, to: number): readonly [number, number] {
    const [head, tail] = this.hull(from, to);
    let low = Math.min(head, tail);
    let high = Math.max(head, tail);

    const { blocks, reach } = this.hidden;

    for (
      let index = firstAfter(reach, (end) => end <= from);
      index < blocks.length;
      index += 1
    ) {
      const { from: start, owner, to: end } = getDefined(blocks[index]);

      countLedgerWork('hiddenBlocks');
      if (start >= to) break;
      if (end > from && owner) {
        low = Math.min(low, owner[0]);
        high = Math.max(high, owner[1]);
      }
    }

    return [low, high];
  }
}

const PLACES = new WeakMap<Run, RunPlaces>();

/** @internal */
export const placesOf = (run: Run) => {
  let places = PLACES.get(run);

  if (!places) {
    countLedgerWork('placesBuilt');
    places = new RunPlaces(run);
    PLACES.set(run, places);
  }

  return places;
};

/** The places a list of sibling blocks maps, as a level holds them. */
type ListPlaces = Readonly<{
  added(position: number): Readonly<{ from: number; to: number }> | null;
  breaks(from: number, to: number): readonly ProjectionBreak[];
  dissolves(position: number): boolean;
  hides(position: number): boolean;
  alignedIn(from: number, to: number): boolean;
  readers(low: number, high: number): readonly [number, number];
  spans(
    from: number,
    to: number,
    wholeContainer: boolean
  ): Array<readonly [number, number]>;
  toProjected(position: number, assoc: -1 | 1): number;
  toStored(position: number, assoc: -1 | 1): number;
}>;

/**
 * The places of a container its level shows: its open and close stay in
 * place, and its children map through the level. Positions are local to
 * the container.
 *
 * @internal
 */
export class ContainerPlaces {
  private readonly list: ListPlaces;
  private readonly outputLength: number;
  private readonly storedLength: number;

  constructor(list: ListPlaces, storedLength: number, outputLength: number) {
    this.list = list;
    this.outputLength = outputLength;
    this.storedLength = storedLength;
  }

  private inner(position: number, length: number) {
    return Math.min(Math.max(position - 1, 0), length - 2);
  }

  toProjected(position: number, assoc: -1 | 1) {
    if (position <= 0) return 0;
    if (position >= this.storedLength) return this.outputLength;

    return 1 + this.list.toProjected(position - 1, assoc);
  }

  toStored(position: number, assoc: -1 | 1) {
    if (position <= 0) return 0;
    if (position >= this.outputLength) return this.storedLength;

    return 1 + this.list.toStored(position - 1, assoc);
  }

  hides(position: number) {
    return (
      position > 0 &&
      position < this.storedLength &&
      this.list.hides(position - 1)
    );
  }

  added(position: number) {
    if (position <= 0 || position >= this.outputLength) return null;

    const span = this.list.added(position - 1);

    return span ? { from: span.from + 1, to: span.to + 1 } : null;
  }

  deletesAtStart() {
    return false;
  }

  deletesAtEnd(_length: number) {
    return false;
  }

  insertsAtEdge(_end: boolean) {
    return 0;
  }

  spans(from: number, to: number): Array<readonly [number, number]> {
    const spans: Array<[number, number]> = [];
    const add = (first: number, next: number) => {
      const previous = spans.at(-1);

      if (previous?.[1] === first) previous[1] = next;
      else spans.push([first, next]);
    };

    if (from <= 0 && to > 0) add(0, 1);

    const head = this.inner(from, this.outputLength);
    const tail = this.inner(to, this.outputLength);

    const wholeContainer = from <= 0 && to >= this.outputLength;

    if (from < this.outputLength - 1 && to > 1) {
      for (const [first, last] of this.list.spans(head, tail, wholeContainer)) {
        add(first + 1, last + 1);
      }
    }
    if (from < this.outputLength && to >= this.outputLength) {
      add(this.storedLength - 1, this.storedLength);
    }

    return spans;
  }

  dissolves(position: number) {
    return (
      position > 0 &&
      position < this.storedLength - 1 &&
      this.list.dissolves(position - 1)
    );
  }

  breaks(from: number, to: number): ProjectionBreak[] {
    return this.list.breaks(from - 1, to - 1).map(({ after, at, before }) => ({
      after: after + 1,
      at: at + 1,
      before: before + 1,
    }));
  }

  alignedIn(from: number, to: number) {
    return this.list.alignedIn(from - 1, to - 1);
  }

  readers(low: number, high: number): readonly [number, number] {
    const [head, tail] = this.list.readers(
      this.inner(low, this.storedLength),
      this.inner(high, this.storedLength)
    );
    const edge = (position: number, inside: number) =>
      position <= 0
        ? 0
        : position >= this.storedLength
          ? this.outputLength
          : 1 + inside;

    return [edge(low, head), edge(high, tail)];
  }
}
