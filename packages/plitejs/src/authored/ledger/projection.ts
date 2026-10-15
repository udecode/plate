import { DocumentIndex } from '../../core/change/document-index';
import {
  addSection,
  mapRootChangePositionBackward,
  RootChange,
  type SectionData,
} from '../../core/change/root-change';
import type { JsonNode } from '../../core/change/tokens';
import { getDefined } from '../../internal/get-defined';
import { tokenLength } from '../tree/alignment';
import {
  type BlockFacts,
  blockFactsOf,
  removesBlock,
  type ReviewMode,
  type Run,
  type RunContext,
  resolveRun,
} from './runs';
import { type Slot, SlotTree } from './slots';
import { countLedgerWork } from './work';

// Summed per slot: stored token length, projected token length, projected
// blocks, whether the slot heads a run the mode changes, and whether the mode
// keeps the block. A run's output sits on its first slot.
const STORED = 0;
const OUTPUT = 1;
const BLOCKS = 2;
const CHANGED = 3;
const KEPT = 4;
const MEASURES = 5;

type BlockSlot = Slot & {
  facts: BlockFacts;
  node: JsonNode;
  /** The slot's place in its run; 0 heads the run. */
  offset: number;
  /** Null for a block the mode leaves alone outside any run. */
  run: Run | null;
};

type Window = [number, number, number, number];

/** Where a range of a root's projection changed in one sync. */
export type ProjectionStep = Readonly<{
  /** The projected root before the sync and the change from it to the one after. */
  change: RootChange;
  from: DocumentIndex;
}>;

const slotsOf = (
  nodes: readonly JsonNode[],
  mode: ReviewMode,
  context: RunContext,
  cache: WeakMap<JsonNode, Run>,
  whole = false
) => {
  const facts = nodes.map(blockFactsOf);
  const removed = facts.map((fact) => removesBlock(mode, fact));
  // A block that opens with a join or split links back past removed blocks
  // to the kept block it merges into.
  const linked = new Uint8Array(nodes.length);

  if (whole && facts.some((fact) => !fact.bare)) linked.fill(1, 1);
  for (let index = 1; index < nodes.length; index += 1) {
    const fact = getDefined(facts[index]);

    if (!fact.opensWithStructure) continue;
    // A join passes over blocks that follow it to the line it was made against.
    for (let back = index; back > 0; back -= 1) {
      linked[back] = 1;
      if (
        !removed[back - 1] &&
        !getDefined(facts[back - 1]).follows.some((key) =>
          fact.joins.includes(key)
        )
      ) {
        break;
      }
    }
  }
  // A follower lands after its join's line, so everything between them
  // resolves together.
  for (const key of new Set(facts.flatMap((fact) => fact.follows))) {
    const related = facts.flatMap((fact, index) =>
      fact.follows.includes(key) || fact.joins.includes(key) ? [index] : []
    );

    if (!related.some((index) => getDefined(facts[index]).joins.includes(key))) {
      continue;
    }
    linked.fill(1, getDefined(related[0]) + 1, getDefined(related.at(-1)) + 1);
  }

  const slots: BlockSlot[] = [];

  for (let index = 0; index < nodes.length;) {
    let end = index + 1;

    while (end < nodes.length && linked[end]) end += 1;

    const node = getDefined(nodes[index]);
    const fact = getDefined(facts[index]);

    if (end === index + 1 && fact.bare) {
      const length = tokenLength(node);

      slots.push({
        facts: fact,
        leaf: null,
        measures: [length, length, 1, 0, 1],
        node,
        offset: 0,
        run: null,
      });
      index = end;
      continue;
    }

    const run = resolveRun(nodes.slice(index, end), context, cache, whole);

    for (let at = index; at < end; at += 1) {
      const head = at === index;

      slots.push({
        facts: getDefined(facts[at]),
        leaf: null,
        measures: [
          tokenLength(getDefined(nodes[at])),
          head ? run.outputLength : 0,
          head ? run.output.length : 0,
          head && run.change ? 1 : 0,
          getDefined(removed[at]) ? 0 : 1,
        ],
        node: getDefined(nodes[at]),
        offset: at - index,
        run,
      });
    }
    index = end;
  }
  countLedgerWork('windowSlots', slots.length);

  return slots;
};

const outputOf = (slots: readonly BlockSlot[]) =>
  slots.flatMap((slot) =>
    slot.run ? (slot.offset === 0 ? slot.run.output : []) : [slot.node]
  );

// The projected span a pure insertion at a section edge reaches, when the
// change starts or ends with one.
const edgeInsertion = (change: RootChange, end: boolean) => {
  const { sections } = change;
  const pair = end ? sections.length - 2 : 0;

  return pair >= 0 && sections[pair] === 0 && getDefined(sections[pair + 1]) > 0
    ? getDefined(sections[pair + 1])
    : 0;
};

// Runs resolve apart, and no run alone can check a required prefix or a
// minimum above one block.
const wholeRoot = (context: RunContext) => {
  const content = context.schema?.content(null, context.root);

  return !!content && (content.prefix > 0 || content.min > 1);
};

/**
 * One content root of a stored document as one review mode shows it, kept
 * in step with the stored root it last synced to.
 *
 * @internal
 */
export class RootProjection {
  private cache = new WeakMap<JsonNode, Run>();
  /** Slots that follow a join, and slots that hold one, by the join's incarnation. */
  private readonly followers = new Map<string, Set<BlockSlot>>();
  private readonly joiners = new Map<string, Set<BlockSlot>>();
  private projected: DocumentIndex;
  private slots: SlotTree<BlockSlot>;
  private stored: DocumentIndex;
  /** The step that gave the current projection, while it is the last one. */
  private step: ProjectionStep | null = null;

  constructor(
    readonly mode: ReviewMode,
    stored: DocumentIndex,
    context: RunContext
  ) {
    const built = this.build(stored, context);

    this.stored = stored;
    this.slots = built.slots;
    this.projected = built.projected;
    this.slots.forEach(0, this.slots.size, (slot) => this.relate(slot, true));
  }

  /** Whether the mode changes anything in the root. */
  get changed() {
    return this.slots.total(CHANGED) > 0;
  }

  get index() {
    return this.projected;
  }

  /** The step that gave the current projection, when the last sync changed it. */
  get lastStep() {
    return this.step;
  }

  /** Forget resolved runs, as when the verdicts they read change. */
  forgetRuns(context: RunContext) {
    this.cache = new WeakMap();
    this.rebuild(this.stored, context);
    this.step = null;
  }

  /**
   * Bring the projection to `stored`, deriving again only the runs its
   * changed blocks reach. Returns null when the projection stays the same.
   */
  sync(stored: DocumentIndex, context: RunContext): ProjectionStep | null {
    if (stored === this.stored) return null;

    const from = this.projected;

    if (!wholeRoot(context)) {
      const ranges = this.stored.changedChildren(stored);

      if (ranges.length === 0) {
        this.stored = stored;
        return null;
      }
      this.step = this.apply(ranges, stored, context);
      if (!this.emptied()) return this.step;
    }
    this.rebuild(stored, context);
    this.step = { change: RootChange.between(from, this.projected), from };

    return this.step;
  }

  // Accepting every block away leaves the root to its completion.
  private emptied() {
    return this.slots.total(BLOCKS) === 0 && this.stored.size > 0;
  }

  private apply(
    ranges: readonly Window[],
    stored: DocumentIndex,
    context: RunContext
  ): ProjectionStep | null {

    const from = this.projected;

    // A value that shares nothing with the synced one costs a rebuild either way.
    if (
      ranges.length === 1 &&
      getDefined(ranges[0])[0] === 0 &&
      getDefined(ranges[0])[1] === this.stored.size &&
      this.stored.size > 1 &&
      stored.size > 1
    ) {
      this.rebuild(stored, context);

      return { change: RootChange.between(from, this.projected), from };
    }

    let composed: RootChange | null = null;

    for (let next = ranges.length - 1; next >= 0;) {
      const window = this.grow(ranges, next, stored);
      const [fromA, toA, fromB, toB] = window.range;
      const firstBlock = this.slots.sumBefore(fromA, BLOCKS);
      const lastBlock = this.slots.sumBefore(toA, BLOCKS);
      const slots = slotsOf(
        stored.nodes.slice(fromB, toB),
        this.mode,
        context,
        this.cache
      );
      const before = DocumentIndex.fromIndexedNodes(
        this.projected.nodes.slice(firstBlock, lastBlock)
      );
      const after = DocumentIndex.fromIndexedNodes(outputOf(slots));
      const step = RootChange.between(before, after, {
        isSetValued: context.isSetValued,
      }).embed(
        this.projected.length,
        this.projected.childPosition([], firstBlock)
      );

      this.slots.forEach(fromA, toA, (slot) => this.relate(slot, false));
      this.slots.splice(fromA, toA - fromA, slots);
      for (const slot of slots) this.relate(slot, true);
      this.projected = step.apply(this.projected);
      composed = composed ? composed.compose(step) : step;
      next = window.next;
    }
    this.stored = stored;

    return composed && { change: composed, from };
  }

  /** The projected position of a stored one. */
  toProjected(position: number, assoc: -1 | 1) {
    if (!this.changed) return position;

    const rank = this.headRank(
      Math.min(
        this.slots.search(STORED, position, assoc > 0 ? false : true),
        this.slots.size - 1
      )
    );
    const slot = this.slots.at(rank);
    const local = position - this.slots.sumBefore(rank, STORED);
    const start = this.slots.sumBefore(rank, OUTPUT);

    return slot.run?.change
      ? start + getDefined(slot.run.change.mapPos(local, assoc))
      : start + local;
  }

  /** The stored position of a projected one; `assoc` picks the edge of removed content. */
  toStored(position: number, assoc: -1 | 1) {
    if (!this.changed) return position;

    const rank = this.headRank(
      Math.min(
        this.slots.search(OUTPUT, position, assoc < 0),
        this.slots.size - 1
      )
    );
    const slot = this.slots.at(rank);
    const local = position - this.slots.sumBefore(rank, OUTPUT);
    const start = this.slots.sumBefore(rank, STORED);

    return slot.run?.change
      ? start +
          getDefined(
            mapRootChangePositionBackward(slot.run.change, local, assoc)
          )
      : start + local;
  }

  /** Whether a stored position lies strictly inside content the mode removes. */
  hides(position: number) {
    if (!this.changed) return false;

    const rank = this.slots.search(STORED, position, false);

    if (rank >= this.slots.size) return false;

    const head = this.headRank(rank);
    const change = this.slots.at(head).run?.change;
    let before = position - this.slots.sumBefore(head, STORED);

    if (!change) return false;
    for (let pair = 0; pair < change.sections.length; pair += 2) {
      const length = getDefined(change.sections[pair]);

      if (getDefined(change.sections[pair + 1]) >= 0 && before > 0 && before < length) {
        return true;
      }
      before -= length;
      if (before < 0) return false;
    }

    return false;
  }

  /** The projected span of content the mode inserts that strictly holds a position. */
  added(position: number) {
    if (!this.changed) return null;

    const rank = this.slots.search(OUTPUT, position, false);

    if (rank >= this.slots.size) return null;

    const head = this.headRank(rank);
    const change = this.slots.at(head).run?.change;
    const start = this.slots.sumBefore(head, OUTPUT);
    const local = position - start;

    if (local === 0 && head > 0 && change && edgeInsertion(change, false) > 0) {
      const previous = this.headRank(head - 1);
      const back = this.slots.at(previous).run?.change;
      const trailing = back ? edgeInsertion(back, true) : 0;

      if (trailing > 0) {
        return {
          from: start - trailing,
          to: start + edgeInsertion(change, false),
        };
      }
    }
    if (!change) return null;

    let after = 0;

    for (let pair = 0; pair < change.sections.length; pair += 2) {
      const inserted = getDefined(change.sections[pair + 1]);
      const length = inserted < 0 ? getDefined(change.sections[pair]) : inserted;

      if (inserted > 0 && after < local && local < after + length) {
        return { from: start + after, to: start + after + length };
      }
      after += length;
      if (after > local) return null;
    }

    return null;
  }

  /** The whole change from the stored root to the projected one. */
  composedChange() {
    countLedgerWork('composedChanges');

    const sections: number[] = [];
    const data: SectionData[] = [];
    let at = 0;

    for (let count = 0; count < this.slots.total(CHANGED); count += 1) {
      const rank = this.slots.search(CHANGED, count, false);
      const change = getDefined(this.slots.at(rank).run?.change);
      const start = this.slots.sumBefore(rank, STORED);

      addSection(sections, data, start - at, -1, null);
      for (let index = 0; index < change.sections.length; index += 2) {
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

  private build(stored: DocumentIndex, context: RunContext) {
    countLedgerWork('rebuilds');

    const nodes = stored.nodes.slice();
    let slots = slotsOf(nodes, this.mode, context, this.cache);

    if (
      wholeRoot(context) ||
      (nodes.length > 0 && slots.every((slot) => slot.measures[BLOCKS] === 0))
    ) {
      countLedgerWork('wholeResolves');
      slots = slotsOf(nodes, this.mode, context, this.cache, true);
    }

    return {
      projected: DocumentIndex.fromIndexedNodes(outputOf(slots)),
      slots: new SlotTree<BlockSlot>(MEASURES, slots),
    };
  }

  private rebuild(stored: DocumentIndex, context: RunContext) {
    const built = this.build(stored, context);

    this.followers.clear();
    this.joiners.clear();
    this.stored = stored;
    this.slots = built.slots;
    this.projected = built.projected;
    this.slots.forEach(0, this.slots.size, (slot) => this.relate(slot, true));
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

  // The synced slots a window's blocks relate to through a followed join.
  private relatedTo(keys: Iterable<string>) {
    const slots: BlockSlot[] = [];

    for (const key of keys) {
      if (!this.followers.has(key)) continue;
      for (const slot of [
        ...(this.followers.get(key) ?? []),
        ...(this.joiners.get(key) ?? []),
      ]) {
        if (slot.leaf) slots.push(slot);
      }
    }

    return slots;
  }

  // Grow `ranges[at]` to whole runs and to the blocks that link into it.
  // Ranges right of it are synced already, so the tree's ranks past the
  // window line up with `stored`'s; ranks left of it are old, and a window
  // that reaches a range on its left takes that range in.
  private grow(ranges: readonly Window[], at: number, stored: DocumentIndex) {
    const shifts = [0];

    for (const [fromA, toA, fromB, toB] of ranges) {
      shifts.push(getDefined(shifts.at(-1)) + toB - fromB - (toA - fromA));
    }

    let next = at - 1;
    let [fromA, toA, fromB, toB] = getDefined(ranges[at]);
    // Take in every range left of the window that `fromA` reaches, and line
    // `fromB` up with it.
    const reachLeft = (rank: number) => {
      let start = rank;

      while (next >= 0 && start < getDefined(ranges[next])[1]) {
        start = Math.min(start, getDefined(ranges[next])[0]);
        next -= 1;
      }
      fromA = start;
      fromB = start + getDefined(shifts[next + 1]);
    };
    const reachLeftNew = (rank: number) => {
      while (next >= 0 && rank < getDefined(ranges[next])[3]) {
        reachLeft(getDefined(ranges[next])[0]);
      }
      if (fromB > rank) {
        fromA -= fromB - rank;
        fromB = rank;
      }
    };
    const removedAt = (rank: number) => {
      countLedgerWork('visitedNodes');

      return removesBlock(
        this.mode,
        blockFactsOf(getDefined(stored.child(rank)))
      );
    };
    const opensAt = (rank: number) =>
      blockFactsOf(getDefined(stored.child(rank))).opensWithStructure;
    // The first block at or after `rank` the mode keeps: the window's own
    // blocks one by one, synced blocks right of it through the tree.
    const firstKeptFrom = (rank: number) => {
      let at = rank;

      for (; at < toB; at += 1) if (!removedAt(at)) return at;

      const tree = toA + at - toB;

      if (tree >= this.slots.size) return stored.size;

      const kept = this.slots.search(
        KEPT,
        this.slots.sumBefore(tree, KEPT),
        false
      );

      return kept >= this.slots.size ? stored.size : toB + kept - toA;
    };
    // Move the window's start left to the nearest block the mode keeps,
    // through the tree over unchanged blocks, taking in ranges on the way.
    const backToKept = () => {
      while (fromB > 0 && removedAt(fromB)) {
        const limit = next >= 0 ? getDefined(ranges[next])[1] : 0;

        if (fromA > limit) {
          const before = this.slots.sumBefore(fromA, KEPT);

          reachLeft(
            before > this.slots.sumBefore(limit, KEPT)
              ? this.slots.search(KEPT, before - 1, false)
              : limit
          );
          continue;
        }
        reachLeftNew(fromB - 1);
      }
    };

    for (let grown = true; grown;) {
      grown = false;
      if (fromA < this.slots.size) {
        const start = fromA - this.slots.at(fromA).offset;

        if (start < fromA) {
          reachLeft(start);
          grown = true;
        }
      }
      if (fromA < this.slots.size) {
        const last = Math.min(Math.max(toA, fromA + 1), this.slots.size) - 1;
        const slot = this.slots.at(last);
        const end = slot.run
          ? last - slot.offset + slot.run.nodes.length
          : last + 1;

        if (end > toA) {
          toB += end - toA;
          toA = end;
          grown = true;
        }
      }
      // A block that opens with structure reaches back past removed blocks
      // to the kept block it merges into.
      while (fromB > 0) {
        const first = firstKeptFrom(fromB);

        if (first >= stored.size || !opensAt(first)) break;
        reachLeftNew(fromB - 1);
        backToKept();
        grown = true;
      }

      // And the first kept block after the window may merge into it.
      const after = firstKeptFrom(toB);

      if (after < stored.size && opensAt(after)) {
        toA += after + 1 - toB;
        toB = after + 1;
        grown = true;
      }

      // A follower and its join resolve together wherever they sit.
      const keys = new Set<string>();

      for (let rank = fromB; rank < toB; rank += 1) {
        const fact = blockFactsOf(getDefined(stored.child(rank)));

        for (const key of [...fact.follows, ...fact.joins]) keys.add(key);
      }
      this.slots.forEach(fromA, toA, (slot) => {
        for (const key of [...slot.facts.follows, ...slot.facts.joins]) {
          keys.add(key);
        }
      });
      for (const slot of this.relatedTo(keys)) {
        const rank = this.slots.rankOf(slot);

        if (rank < fromA) {
          reachLeft(rank);
          grown = true;
        } else if (rank >= toA) {
          toB += rank + 1 - toA;
          toA = rank + 1;
          grown = true;
        }
      }
    }

    return { next, range: [fromA, toA, fromB, toB] as Window };
  }

}
