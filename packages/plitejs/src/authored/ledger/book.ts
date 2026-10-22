import type { DocumentIndex } from '../../core/change/document-index';
import type { JsonEditorValue, JsonNode } from '../../core/change/tokens';
import {
  getRecordSetVersion,
  getValueRecords,
  type RecordSetVersion,
  recordSetChanges,
} from '../../core/record-store';
import { getDefined } from '../../internal/get-defined';
import {
  type BlockOccurrence,
  blockOccurrencesOf,
  blockRevisionOf,
  changeOf,
  type Occurrence,
  placeOccurrence,
} from '../changes';
import { factsOf, marksOf, membersOf, type ReviewFacts } from '../facts/facts';
import {
  incarnationOf,
  VERDICTS,
  verdictIncarnationsOf,
} from '../facts/records';
import { tokenLength } from '../tree/alignment';
import { readMembers } from '../tree/marks';
import type { AuthoredChange, AuthoredChangeGroup } from '../types';
import {
  type CardEntry,
  type ChangeSummary,
  cardIn,
  cardOf,
  cardRun,
  ENTRIES,
  entryIndex,
  MEASURES,
  NO_SLOT_CARDS,
  SLOT_OLDEST,
  type SlotCards,
  syncCards,
  TOKENS,
  UNITS,
  walkEntries,
} from './cards';
import {
  firstFrom,
  mapSpans,
  type PairedChanges,
  type Pairing,
  pairStretch,
  rankAt,
  type Span,
  startOf,
} from './pairs';
import { contentRootsOf, type Roots, sameRoots } from './roots';
import { blockFactsOf } from './runs';
import { type Slot, SlotTree } from './slots';
import { countLedgerWork } from './work';

type BlockChanges = PairedChanges &
  Readonly<{
    /** The changes with an occurrence on each node, by its path in the block. */
    byPath: ReadonlyMap<string, readonly string[]>;
    ends: ReadonlyMap<string, BlockOccurrence>;
    /**
     * Every incarnation the block names, decided or not: its claims, held
     * deletions, followed joins and its contexts' members. A verdict changes
     * what the block holds only when it names one of them.
     */
    incarnations: readonly string[];
    units: number;
  }>;

/** @internal */
export type BookSlot = Slot & {
  block: JsonNode;
  book: RootBook;
  cards: SlotCards;
  changes: BlockChanges;
  /** The pending changes this block shows first, in the kernel's order. */
  entries: CardEntry[];
  oldest: CardEntry | null;
};

type VerdictRead = 'accept' | 'reject' | null;

const namedBy = (node: unknown, facts: ReviewFacts, named: Set<string>) => {
  for (const member of readMembers(node)) {
    if (member.kind === 'in') {
      for (const inner of membersOf(facts, member.ctx)) {
        named.add(incarnationOf(inner));
      }
      continue;
    }
    named.add(incarnationOf(member));
    if ('follows' in member && typeof member.follows === 'string') {
      named.add(member.follows);
    }
  }
};

const blockChangesOf = (block: JsonNode, facts: ReviewFacts): BlockChanges => {
  const marked = !blockFactsOf(block).unmarked;
  const named = new Set<string>();
  const { ends, joinsAndSplits, occurrences, ordered, units } =
    blockOccurrencesOf(block, (node) => {
      if (!marked) return [];
      namedBy(node, facts, named);

      return marksOf(node, facts);
    });
  const byPath = new Map<string, string[]>();

  for (const { id, path } of ordered) {
    const key = path.join(',');
    const ids = byPath.get(key);

    if (ids) ids.push(id);
    else byPath.set(key, [id]);
  }

  return {
    byPath,
    ends,
    incarnations: [...named],
    joinsAndSplits,
    occurrences,
    ordered,
    units,
  };
};

type HeldPart = Readonly<{ createdAt: number; revision: number }>;

/**
 * A pending change as one root holds it, kept in step with the blocks that
 * come and go, so a key reads only its own blocks' parts.
 */
class HeldChange {
  /** The blocks holding the change, in document order. */
  readonly holders: BookSlot[] = [];
  readonly parts = new Map<BookSlot, HeldPart>();
  revision = 0;
  private readonly times = new Map<number, number>();
  private oldest = Number.POSITIVE_INFINITY;

  get createdAt() {
    if (!this.times.has(this.oldest)) {
      this.oldest = Number.POSITIVE_INFINITY;
      for (const time of this.times.keys()) {
        if (time < this.oldest) this.oldest = time;
      }
    }

    return this.oldest;
  }

  add(part: HeldPart, sign: 1 | -1) {
    const holding = (this.times.get(part.createdAt) ?? 0) + sign;

    this.revision = (this.revision + sign * part.revision) >>> 0;
    if (holding === 0) this.times.delete(part.createdAt);
    else this.times.set(part.createdAt, holding);
    if (sign === 1 && part.createdAt < this.oldest) {
      this.oldest = part.createdAt;
    }
  }
}

/** @internal */
export class RootBook {
  readonly held = new Map<string, HeldChange>();
  private readonly naming = new Map<string, Set<BookSlot>>();
  rootIndex = 0;
  readonly slots: SlotTree<BookSlot, CardEntry>;
  readonly root: string;
  private stored: DocumentIndex;
  private readonly heldBy: (id: string, book: RootBook, held: boolean) => void;

  constructor(
    root: string,
    stored: DocumentIndex,
    changesOf: (block: JsonNode) => BlockChanges,
    touched: Set<string>,
    heldBy: (id: string, book: RootBook, held: boolean) => void
  ) {
    this.root = root;
    this.stored = stored;
    this.heldBy = heldBy;
    this.slots = this.build(stored, changesOf, touched);
  }

  private build(
    stored: DocumentIndex,
    changesOf: (block: JsonNode) => BlockChanges,
    touched: Set<string>
  ) {
    countLedgerWork('rebuilds');

    const slots = stored.nodes
      .slice(0, stored.size)
      .map((block) => slotOf(block, changesOf, this));

    // The slots come in document order and the tree does not hold them yet,
    // so each holder goes last.
    for (const slot of slots) {
      this.name(slot, true);
      for (const [id, list] of slot.changes.occurrences) {
        touched.add(id);
        this.heldOf(id).holders.push(slot);
        this.addPart(id, slot, list);
      }
    }

    return new SlotTree<BookSlot, CardEntry>(MEASURES, slots, SLOT_OLDEST);
  }

  private name(slot: BookSlot, add: boolean) {
    for (const incarnation of slot.changes.incarnations) {
      const slots = this.naming.get(incarnation) ?? new Set<BookSlot>();

      if (add) {
        slots.add(slot);
        this.naming.set(incarnation, slots);
      } else {
        slots.delete(slot);
        if (slots.size === 0) this.naming.delete(incarnation);
      }
    }
  }

  private heldOf(id: string) {
    let held = this.held.get(id);

    if (!held) {
      held = new HeldChange();
      this.held.set(id, held);
      this.heldBy(id, this, true);
    }

    return held;
  }

  private addPart(
    id: string,
    slot: BookSlot,
    list: readonly BlockOccurrence[]
  ) {
    const part = {
      createdAt: Math.min(...list.map(({ mark }) => mark.at)),
      revision: blockRevisionOf(this.root, list),
    };
    const held = getDefined(this.held.get(id));

    held.parts.set(slot, part);
    held.add(part, 1);
  }

  private dropPart(id: string, slot: BookSlot) {
    const held = getDefined(this.held.get(id));

    held.add(getDefined(held.parts.get(slot)), -1);
    held.parts.delete(slot);
  }

  /** Where `slot`, which the tree holds, goes among `holders`. */
  private holderIndex(holders: readonly BookSlot[], slot: BookSlot) {
    const rank = this.slots.rankOf(slot);
    let low = 0;
    let high = holders.length;

    while (low < high) {
      const middle = (low + high) >> 1;

      countLedgerWork('holderReads');
      if (this.slots.rankOf(getDefined(holders[middle])) < rank) {
        low = middle + 1;
      } else high = middle;
    }

    return low;
  }

  private hold(slot: BookSlot, add: boolean, touched: Set<string> | null) {
    this.name(slot, add);
    for (const [id, list] of slot.changes.occurrences) {
      touched?.add(id);
      if (add) this.addHolder(id, slot, list);
      else this.dropHolder(id, slot);
    }
  }

  private addHolder(
    id: string,
    slot: BookSlot,
    list: readonly BlockOccurrence[]
  ) {
    const { holders } = this.heldOf(id);

    holders.splice(this.holderIndex(holders, slot), 0, slot);
    this.addPart(id, slot, list);
  }

  private dropHolder(id: string, slot: BookSlot) {
    const held = getDefined(this.held.get(id));

    this.dropPart(id, slot);
    held.holders.splice(this.holderIndex(held.holders, slot), 1);
    if (held.holders.length === 0) {
      this.held.delete(id);
      this.heldBy(id, this, false);
    }
  }

  /**
   * Put `block` in `slot`, the block it replaced, so the entries of the
   * changes a pairing left untouched stay in place, and a change the slot
   * holds before and after keeps its place among its holders.
   */
  private replace(
    slot: BookSlot,
    block: JsonNode,
    changes: BlockChanges,
    rechecked: Map<BookSlot, RootBook>
  ) {
    const old = slot.changes;

    this.name(slot, false);
    for (const id of old.occurrences.keys()) {
      if (changes.occurrences.has(id)) this.dropPart(id, slot);
      else this.dropHolder(id, slot);
    }
    slot.block = block;
    slot.changes = changes;
    slot.measures[UNITS] = changes.units;
    slot.measures[TOKENS] = tokenLength(block);
    this.name(slot, true);
    for (const [id, list] of changes.occurrences) {
      if (old.occurrences.has(id)) this.addPart(id, slot, list);
      else this.addHolder(id, slot, list);
    }
    if (slot.leaf) this.slots.update(slot);
    rechecked.set(slot, this);
  }

  /**
   * Move to `stored`, pairing each block the commit replaced with the block
   * it replaced, in order between the blocks both versions keep, and add to
   * `sites` the ranges of `stored` whose pairs differ.
   */
  sync(
    stored: DocumentIndex,
    changesOf: (block: JsonNode) => BlockChanges,
    identity: Pairing['identity'],
    touched: Set<string>,
    spliced: Array<Readonly<{ book: RootBook; rank: number }>>,
    rechecked: Map<BookSlot, RootBook>,
    sites: Span[] | null
  ) {
    if (stored === this.stored) return;

    const ranges = this.stored.changedChildren(stored);
    const out: Pairing = { identity, sites, touched, verdicts: false };

    // Stretches go back to front, so each one's old ranks still index the
    // slots.
    for (let next = ranges.length - 1; next >= 0; next -= 1) {
      const [fromA, toA, fromB, toB] = getDefined(ranges[next]);
      const old: BookSlot[] = [];

      this.slots.forEach(fromA, toA, (slot) => {
        old.push(slot);
      });

      const blocks = stored.nodes
        .slice(fromB, toB)
        .map((block) => ({ block, changes: changesOf(block) }));
      const paired = Math.min(old.length, blocks.length);

      pairStretch(
        old,
        blocks,
        startOf(this.stored, fromA),
        startOf(stored, fromB),
        out
      );
      for (let offset = 0; offset < paired; offset += 1) {
        const slot = getDefined(old[offset]);
        const { block, changes } = getDefined(blocks[offset]);

        // A slot takes the block in its place, which pairing may have
        // paired with another block, so its changes move whole.
        if (identity(slot.block) !== identity(block)) {
          for (const id of slot.changes.occurrences.keys()) touched.add(id);
          for (const id of changes.occurrences.keys()) touched.add(id);
        }
        this.replace(slot, block, changes, rechecked);
      }

      const removed = old.slice(paired);
      const inserted = blocks
        .slice(paired)
        .map(({ block }) => slotOf(block, changesOf, this));

      // A holder's place among its change's holders reads its rank, so a
      // slot leaves while the tree holds it and joins once the tree does.
      for (const slot of removed) this.hold(slot, false, touched);
      if (removed.length > 0) {
        this.slots.splice(fromA + paired, removed.length, []);
      }
      if (inserted.length > 0) this.slots.splice(fromA + paired, 0, inserted);
      for (const slot of inserted) this.hold(slot, true, touched);
      spliced.push({ book: this, rank: fromB }, { book: this, rank: toB });
      countLedgerWork('bookEntries', toA - fromA + inserted.length);
    }
    this.stored = stored;
  }

  private slotsNaming(incarnations: Iterable<string>) {
    const slots = new Set<BookSlot>();

    for (const incarnation of incarnations) {
      for (const slot of this.naming.get(incarnation) ?? []) slots.add(slot);
    }

    return slots;
  }

  ranksNaming(incarnations: Iterable<string>) {
    return [...this.slotsNaming(incarnations)]
      .map((slot) => this.slots.rankOf(slot))
      .sort((left, right) => left - right);
  }

  /**
   * Read again the blocks naming `incarnations`, whose verdict changed, and
   * add to `out` the ranges whose pairs differ.
   */
  reread(
    incarnations: Iterable<string>,
    changesOf: (block: JsonNode) => BlockChanges,
    touched: Set<string>,
    out: Pairing | null
  ) {
    const slots = this.slotsNaming(incarnations);

    for (const slot of slots) {
      const old = { block: slot.block, changes: slot.changes };

      for (const id of old.changes.occurrences.keys()) {
        touched.add(id);
        this.dropHolder(id, slot);
      }
      slot.changes = changesOf(slot.block);
      if (out) {
        const start = this.slots.sumBefore(this.slots.rankOf(slot), TOKENS);

        pairStretch([old], [slot], start, start, out);
      }
      for (const [id, list] of slot.changes.occurrences) {
        touched.add(id);
        this.addHolder(id, slot, list);
      }
    }
    countLedgerWork('bookEntries', slots.size);
  }

  occurrences(id: string): Occurrence[] {
    const holders = this.held.get(id)?.holders ?? [];

    countLedgerWork('holderReads', holders.length);

    return holders.flatMap((slot) => {
      const rank = this.slots.rankOf(slot);
      const before = this.slots.sumBefore(rank, UNITS);

      return getDefined(slot.changes.occurrences.get(id)).map((local) =>
        placeOccurrence(local, this.root, rank, before)
      );
    });
  }

  /**
   * Add to `ids` the changes with an occurrence on a node that opens in one
   * of `spans`, stored token ranges, or on an ancestor of a span's start
   * whose open token `dissolves` names.
   */
  shown(
    spans: ReadonlyArray<readonly [number, number]>,
    dissolves: (position: number) => boolean,
    ids: Set<string>
  ) {
    const { slots } = this;

    addShown(
      {
        changesAt: (rank) => slots.at(rank).changes,
        index: this.stored,
        rankAt: (position) => slots.search(TOKENS, position, false),
        size: slots.size,
        startOf: (rank) => slots.sumBefore(rank, TOKENS),
      },
      spans,
      dissolves,
      ids
    );
  }
}

/** A version of a root, read by its top-level blocks. */
type ShownBlocks = Readonly<{
  changesAt: (rank: number) => BlockChanges;
  index: DocumentIndex;
  rankAt: (position: number) => number;
  size: number;
  startOf: (rank: number) => number;
}>;

/**
 * Add to `ids` the changes with an occurrence on a node that opens in one of
 * `spans`, token ranges of `blocks.index`, or on an ancestor of a span's start
 * whose open token `dissolves` names.
 */
const addShown = (
  blocks: ShownBlocks,
  spans: ReadonlyArray<readonly [number, number]>,
  dissolves: (position: number) => boolean,
  ids: Set<string>
) => {
  for (const [from, to] of spans) {
    for (const entry of blocks.index.openContextAt(from)) {
      if (entry.from >= from || entry.to <= from || !dissolves(entry.from)) {
        continue;
      }

      const [rank, ...path] = entry.path;

      for (const id of blocks
        .changesAt(getDefined(rank))
        .byPath.get(path.join(',')) ?? []) {
        countLedgerWork('occurrencesVisited');
        ids.add(id);
      }
    }

    for (let rank = blocks.rankAt(from); rank < blocks.size; rank += 1) {
      const start = blocks.startOf(rank);

      if (start >= to) break;

      const changes = blocks.changesAt(rank);
      const { ordered } = changes;

      for (
        let at = firstFrom(changes, from - start);
        at < ordered.length && getDefined(ordered[at]).from < to - start;
        at += 1
      ) {
        countLedgerWork('occurrencesVisited');
        ids.add(getDefined(ordered[at]).id);
      }
    }
  }
};

const slotOf = (
  block: JsonNode,
  changesOf: (block: JsonNode) => BlockChanges,
  book: RootBook
): BookSlot => {
  const changes = changesOf(block);

  return {
    block,
    book,
    cards: NO_SLOT_CARDS,
    changes,
    entries: [],
    leaf: null,
    measures: [changes.units, 0, 0, 0, tokenLength(block)],
    oldest: null,
  };
};

// The kernel orders roots `main` first, then by name.
const rootOrder = (left: RootBook, right: RootBook) =>
  left.root === right.root
    ? 0
    : left.root === 'main'
      ? -1
      : right.root === 'main'
        ? 1
        : left.root < right.root
          ? -1
          : 1;

const UNSET = {};

/** @internal */
export type BookDelta = Readonly<{
  changed: readonly string[];
  groups: readonly string[];
  removed: readonly string[];
}>;

/**
 * One publisher's gathered set: by root, the ranges of the blocks whose
 * pairs a sync since its last publication changed and of the members whose
 * card changed, mapped forward through each sync into `index`.
 *
 * @internal
 */
export type BookSink = {
  /** The preview the publisher subscribed or last published under. */
  mode: 'accepted' | 'proposed' | null;
  sites: Map<string, Readonly<{ index: DocumentIndex; spans: Span[] }>>;
};

const gather = (
  sink: BookSink,
  root: string,
  index: DocumentIndex,
  spans: readonly Span[],
  identity: Pairing['identity']
) => {
  const gathered = sink.sites.get(root);

  sink.sites.set(root, {
    index,
    spans: gathered
      ? [...mapSpans(gathered.index, index, gathered.spans, identity), ...spans]
      : [...spans],
  });
};

type IdsFrom = Readonly<{
  after?: boolean;
  group?: string | null;
  start?: string | null;
}>;

/**
 * What the book reads of the document its sync named. A view throws once the
 * book syncs to another document, so no read answers for the wrong one.
 *
 * @internal
 */
export type BookView = Readonly<{
  /** The cards of `ids`, given in document order, one summary per card. */
  cardsOf: (ids: readonly string[]) => AuthoredChangeGroup[];
  change: (id: string) => AuthoredChange | null;
  groupOf: (id: string) => AuthoredChangeGroup | null;
  has: (id: string) => boolean;
  /** Whether a change sits in the card holding `group`, without summaries. */
  inCard: (group: string) => (id: string) => boolean;
  idsFrom: (from: IdsFrom) => Generator<string>;
  idsIn: (root: string, from: number, to: number) => Set<string>;
  idsShown: (
    root: string,
    spans: ReadonlyArray<readonly [number, number]>,
    dissolves: (position: number) => boolean
  ) => Set<string>;
  pendingInOrder: (ids: Iterable<string>) => string[];
  members: (id: string) => readonly CardEntry[];
  occurrences: (id: string) => readonly Occurrence[];
  ranksNaming: (
    incarnations: readonly string[]
  ) => Map<string, readonly number[]>;
}>;

const EMPTY_DELTA: BookDelta = Object.freeze({
  changed: [],
  groups: [],
  removed: [],
});

/**
 * Every pending change of one stored document, block by block, kept in step
 * with the value each reader asks about, so a key reads only the blocks its
 * edit changed and a read places a change through its blocks' ranks.
 *
 * @internal
 */
export class ChangeBook {
  private readonly entries = new Map<string, CardEntry>();
  private readonly roots = new Map<string, RootBook>();
  private readonly holding = new Map<string, Set<RootBook>>();
  private readonly heldBy = (id: string, book: RootBook, held: boolean) => {
    const books = this.holding.get(id) ?? new Set<RootBook>();

    if (held) {
      books.add(book);
      this.holding.set(id, books);
    } else {
      books.delete(book);
      if (books.size === 0) this.holding.delete(id);
    }
  };
  private readonly blocks = new WeakMap<
    JsonNode,
    Readonly<{ changes: BlockChanges; verdicts: readonly VerdictRead[] }>
  >();
  private published: {
    cards: Map<string, number>;
    delta: BookDelta;
    revisions: Map<string, number>;
    sinks: Set<BookSink>;
  } | null = null;
  private unpublished = {
    ended: new Set<string>(),
    entries: new Set<CardEntry>(),
    ids: new Set<string>(),
  };
  private verdicts: RecordSetVersion | undefined;
  private facts: ReviewFacts | null = null;
  // What the last sync read, which a sync to another document replaces.
  private read: {
    changes: Map<string, AuthoredChange | null>;
    view?: BookView;
  } = { changes: new Map() };
  private records: unknown = UNSET;
  private stored: Roots = new Map();
  private readonly identity: Pairing['identity'];

  constructor(identity: Pairing['identity']) {
    this.identity = identity;
  }

  private readonly verdictOf = (incarnation: string): VerdictRead => {
    const facts = getDefined(this.facts);

    return facts.hasVerdict(incarnation, 'accept')
      ? 'accept'
      : facts.hasVerdict(incarnation)
        ? 'reject'
        : null;
  };

  private readonly changesOf = (block: JsonNode) => {
    const read = this.blocks.get(block);

    if (
      read?.changes.incarnations.every(
        (incarnation, index) =>
          this.verdictOf(incarnation) === read.verdicts[index]
      )
    ) {
      return read.changes;
    }

    const changes = blockChangesOf(block, getDefined(this.facts));

    this.blocks.set(block, {
      changes,
      verdicts: changes.incarnations.map(this.verdictOf),
    });

    return changes;
  };

  sync(value: JsonEditorValue): BookView {
    const records = getValueRecords(value);
    const content = contentRootsOf(value);

    if (records === this.records && sameRoots(content, this.stored)) {
      return this.view();
    }

    const verdicts = getRecordSetVersion(records, VERDICTS);
    const touched = new Set<string>();

    this.facts = factsOf(value);
    for (const root of this.roots.keys()) {
      if (content.has(root)) continue;
      const book = getDefined(this.roots.get(root));

      for (const id of book.held.keys()) {
        touched.add(id);
        this.heldBy(id, book, false);
      }
      this.roots.delete(root);
    }

    const roots = new Map<string, RootBook>();
    const spliced: Array<Readonly<{ book: RootBook; rank: number }>> = [];
    const rechecked = new Map<BookSlot, RootBook>();
    const sinks = this.published?.sinks;
    const sites = new Map<string, Span[]>();
    const sitesOf = (root: string) => {
      if (!sinks) return null;

      const list = sites.get(root) ?? [];

      sites.set(root, list);

      return list;
    };

    for (const [root, index] of content) {
      const book = this.roots.get(root);

      if (book) {
        book.sync(
          index,
          this.changesOf,
          this.identity,
          touched,
          spliced,
          rechecked,
          sitesOf(root)
        );
      } else {
        sitesOf(root)?.push([0, index.length]);
      }
      const synced =
        book ?? new RootBook(root, index, this.changesOf, touched, this.heldBy);

      synced.rootIndex = roots.size;
      roots.set(root, synced);
    }
    this.roots.clear();
    for (const [root, book] of roots) this.roots.set(root, book);
    // A verdict changes what the blocks naming its incarnation hold.
    if (this.verdicts !== undefined && verdicts !== this.verdicts) {
      const decided = verdictIncarnationsOf(
        recordSetChanges(this.verdicts, verdicts)
      );

      for (const book of this.roots.values()) {
        const list = sitesOf(book.root);

        book.reread(
          decided,
          this.changesOf,
          touched,
          list && {
            identity: this.identity,
            sites: list,
            touched: new Set(),
            verdicts: true,
          }
        );
      }
    }
    for (const sink of sinks ?? []) {
      for (const [root, spans] of sites) {
        if (spans.length > 0) {
          gather(
            sink,
            root,
            getDefined(content.get(root)),
            spans,
            this.identity
          );
        }
      }
    }
    this.verdicts = verdicts;
    this.records = records;
    this.stored = content;
    this.read = { changes: new Map() };
    this.syncCards(touched, spliced, rechecked);

    return this.view();
  }

  private syncCards(
    touched: Set<string>,
    spliced: Array<Readonly<{ book: RootBook; rank: number }>>,
    rechecked: Map<BookSlot, RootBook>
  ) {
    const cards = syncCards(this.entries, touched, spliced, rechecked, (id) =>
      this.summaryOf(id)
    );

    if (this.published) {
      for (const id of touched) this.unpublished.ids.add(id);
      for (const entry of cards.checked) this.unpublished.entries.add(entry);
      for (const entry of cards.near) this.unpublished.entries.add(entry);
      for (const entry of cards.removed) {
        if (entry.published !== undefined) {
          this.unpublished.ended.add(entry.published);
        }
      }
    }
  }

  private view(): BookView {
    const { read } = this;

    if (read.view) return read.view;

    const fresh =
      <A extends unknown[], R>(reads: (...args: A) => R) =>
      (...args: A): R => {
        if (this.read !== read) {
          throw new Error('The change book synced to another document.');
        }

        return reads(...args);
      };

    read.view = Object.freeze({
      cardsOf: fresh((ids: readonly string[]) => this.cardsOf(ids)),
      change: fresh((id: string) => this.change(id)),
      groupOf: fresh((id: string) => this.groupOf(id)),
      has: fresh((id: string) => this.entries.has(id)),
      inCard: fresh((group: string) => this.inCard(group)),
      idsFrom: fresh((from: IdsFrom) => this.idsFrom(from)),
      idsIn: fresh((root: string, from: number, to: number) =>
        this.idsIn(root, from, to)
      ),
      idsShown: fresh(
        (
          root: string,
          spans: ReadonlyArray<readonly [number, number]>,
          dissolves: (position: number) => boolean
        ) => {
          const ids = new Set<string>();

          this.roots.get(root)?.shown(spans, dissolves, ids);

          return ids;
        }
      ),
      pendingInOrder: fresh((ids: Iterable<string>) =>
        this.pendingInOrder(ids)
      ),
      members: fresh((id: string) => this.members(id)),
      occurrences: fresh((id: string) => this.occurrences(id)),
      ranksNaming: fresh((incarnations: readonly string[]) =>
        this.ranksNaming(incarnations)
      ),
    });

    return read.view;
  }

  subscribe(mode: BookSink['mode']): BookSink {
    const sink: BookSink = { mode, sites: new Map() };

    if (this.published) {
      this.published.sinks.add(sink);
      return sink;
    }

    const cards = new Map<string, number>();
    const revisions = new Map<string, number>();

    for (const book of this.ordered()) {
      let card: AuthoredChangeGroup | null = null;

      for (const entry of walkEntries(book, 0, book.slots.total(ENTRIES))) {
        if (entry.starts || !card) {
          card = cardOf(book, entry);
          cards.set(card.id, card.revision);
        }
        entry.published = card.id;
        revisions.set(entry.id, entry.revision);
      }
    }
    this.published = {
      cards,
      delta: EMPTY_DELTA,
      revisions,
      sinks: new Set([sink]),
    };
    this.unpublished = { ended: new Set(), entries: new Set(), ids: new Set() };

    return sink;
  }

  unsubscribe(sink: BookSink) {
    const published = getDefined(this.published);

    published.sinks.delete(sink);
    if (published.sinks.size === 0) this.published = null;
  }

  *sinksUnder(mode: NonNullable<BookSink['mode']>) {
    for (const sink of this.published?.sinks ?? []) {
      if (sink.mode === mode) yield sink;
    }
  }

  /**
   * The changes `spans` of `index`, a version of a root the book may since
   * have left, showed as the book last read each of its blocks, the way
   * `RootBook.shown` reads them.
   */
  idsShownIn(
    index: DocumentIndex,
    spans: ReadonlyArray<readonly [number, number]>,
    dissolves: (position: number) => boolean
  ) {
    const ids = new Set<string>();

    addShown(
      {
        changesAt: (rank) => {
          const block = getDefined(index.child(rank));

          return this.blocks.get(block)?.changes ?? this.changesOf(block);
        },
        index,
        rankAt: (position) => rankAt(index, position),
        size: index.size,
        startOf: (rank) => startOf(index, rank),
      },
      spans,
      dissolves,
      ids
    );

    return ids;
  }

  /**
   * What the syncs since the last publication changed, or the last delta when
   * nothing synced since, so every view of one commit reads the same delta,
   * and by root the stored ranges `sink` gathered since it last published. A
   * card is walked only when a member's card id differs from the one last
   * published for it, so a key that keeps a card's members together walks
   * nothing.
   */
  publish(
    sink: BookSink,
    mode: BookSink['mode']
  ): Readonly<{
    delta: BookDelta;
    sites: ReadonlyMap<string, readonly Span[]>;
  }> {
    this.publishDelta();

    const sites = new Map<string, Span[]>();

    for (const [root, { index, spans }] of sink.sites) {
      const current = this.stored.get(root);

      if (current) {
        sites.set(root, mapSpans(index, current, spans, this.identity));
      }
    }
    sink.sites.clear();
    sink.mode = mode;

    return { delta: getDefined(this.published).delta, sites };
  }

  private publishDelta() {
    const published = getDefined(this.published);
    const { ended, entries, ids } = this.unpublished;

    if (ids.size === 0 && entries.size === 0 && ended.size === 0) return;

    const changed: string[] = [];
    const removed: string[] = [];

    for (const id of ids) {
      const revision = this.entries.get(id)?.revision;

      if (revision === published.revisions.get(id)) continue;
      if (revision === undefined) {
        published.revisions.delete(id);
        removed.push(id);
      } else {
        published.revisions.set(id, revision);
        changed.push(id);
      }
    }

    const groups = new Set<string>();
    const sites = new Map<string, Span[]>();
    // A key inside a block rechecks every entry the block holds, so the
    // members of one card share the summary of its run.
    const runs = new Map<RootBook, Map<number, AuthoredChangeGroup>>();

    for (const entry of entries) {
      if (this.entries.get(entry.id) !== entry) continue;

      const { book } = entry.slot;
      const [from, to] = cardRun(book, entry);
      const known = runs.get(book) ?? new Map<number, AuthoredChangeGroup>();
      const card = known.get(from) ?? cardIn(book, entry.authorId, from, to);

      known.set(from, card);
      runs.set(book, known);

      if (published.cards.get(card.id) !== card.revision) {
        groups.add(card.id);
        published.cards.set(card.id, card.revision);
      }
      if (entry.published === card.id) continue;
      if (
        entry.published === undefined &&
        getDefined(this.entries.get(card.id)).published === card.id
      ) {
        entry.published = card.id;
        continue;
      }
      for (const member of walkEntries(book, from, to)) {
        countLedgerWork('cardWalks');
        if (member.published === card.id) continue;
        // A new member's own blocks changed, so only older members add theirs.
        if (member.published !== undefined) {
          ended.add(member.published);
          this.sitesOf(member.id, sites);
        }
        member.published = card.id;
      }
    }
    for (const id of ended) {
      if (published.cards.has(id) && this.groupOf(id)?.id !== id) {
        groups.add(id);
        published.cards.delete(id);
      }
    }
    for (const sink of published.sinks) {
      for (const [root, spans] of sites) {
        gather(
          sink,
          root,
          getDefined(this.stored.get(root)),
          spans,
          this.identity
        );
      }
    }
    published.delta = Object.freeze({
      changed: Object.freeze(changed),
      groups: Object.freeze([...groups]),
      removed: Object.freeze(removed),
    });
    this.unpublished = { ended: new Set(), entries: new Set(), ids: new Set() };
  }

  private sitesOf(id: string, sites: Map<string, Span[]>) {
    for (const book of this.holding.get(id) ?? []) {
      const { holders } = getDefined(book.held.get(id));

      countLedgerWork('holderReads', holders.length);
      for (const slot of holders) {
        const start = book.slots.sumBefore(book.slots.rankOf(slot), TOKENS);
        const list = sites.get(book.root) ?? [];

        for (const { from, node } of getDefined(
          slot.changes.occurrences.get(id)
        )) {
          list.push([
            start + from,
            start + from + tokenLength(node as JsonNode),
          ]);
        }
        sites.set(book.root, list);
      }
    }
  }

  private ranksNaming(incarnations: readonly string[]) {
    const ranks = new Map<string, readonly number[]>();

    if (incarnations.length === 0) return ranks;
    for (const [root, book] of this.roots) {
      const named = book.ranksNaming(incarnations);

      if (named.length > 0) ranks.set(root, named);
    }

    return ranks;
  }

  private summaryOf(id: string): ChangeSummary | null {
    const books = this.holding.get(id);

    if (!books) return null;

    let first: RootBook | null = null;
    let last: RootBook | null = null;
    let createdAt = Number.POSITIVE_INFINITY;
    let revision = 0;

    for (const book of books) {
      const held = getDefined(book.held.get(id));

      createdAt = Math.min(createdAt, held.createdAt);
      revision = (revision + held.revision) >>> 0;
      if (!first || book.rootIndex < first.rootIndex) first = book;
      if (!last || book.rootIndex > last.rootIndex) last = book;
    }

    const firstSlot = getDefined(getDefined(first).held.get(id)?.holders[0]);
    const lastSlot = getDefined(getDefined(last).held.get(id)?.holders.at(-1));

    return {
      authorId: getDefined(firstSlot.changes.occurrences.get(id)?.[0]).mark
        .author,
      createdAt,
      first: { book: getDefined(first), slot: firstSlot },
      last: { book: getDefined(last), slot: lastSlot },
      revision,
    };
  }

  /** The books in the kernel's root order. */
  private ordered() {
    return [...this.roots.values()].sort(rootOrder);
  }

  private groupOf(id: string): AuthoredChangeGroup | null {
    const entry = this.entries.get(id);

    return entry ? cardOf(entry.slot.book, entry) : null;
  }

  private cardsOf(ids: readonly string[]) {
    const cards = new Map<string, AuthoredChangeGroup>();
    // The ids come in document order, so an id inside the last card's run
    // needs no summary of its own.
    let lastBook: RootBook | null = null;
    let lastTo = 0;

    for (const id of ids) {
      const entry = getDefined(this.entries.get(id));
      const { book } = entry.slot;

      if (lastBook === book && entryIndex(book, entry) < lastTo) continue;

      const [from, to] = cardRun(book, entry);
      const card = cardIn(book, entry.authorId, from, to);

      lastBook = book;
      lastTo = to;
      if (!cards.has(card.id)) cards.set(card.id, card);
    }

    return [...cards.values()];
  }

  private inCard(group: string) {
    const card = this.entries.get(group);

    if (!card) return () => false;

    const { book } = card.slot;
    const [from, to] = cardRun(book, card);

    return (id: string) => {
      const entry = this.entries.get(id);

      if (entry?.slot.book !== book) return false;

      const at = entryIndex(book, entry);

      return from <= at && at < to;
    };
  }

  private idsIn(root: string, from: number, to: number): Set<string> {
    const ids = new Set<string>();
    const book = this.roots.get(root);

    book?.slots.forEach(
      Math.max(0, from),
      Math.min(to, book.slots.size),
      (slot) => {
        for (const id of slot.changes.occurrences.keys()) ids.add(id);
      }
    );

    return ids;
  }

  private pendingInOrder(ids: Iterable<string>): string[] {
    const order = this.ordered();

    return [...ids]
      .flatMap((id) => {
        const entry = this.entries.get(id);

        return entry
          ? [
              {
                at: entryIndex(entry.slot.book, entry),
                id,
                root: order.indexOf(entry.slot.book),
              },
            ]
          : [];
      })
      .sort((left, right) => left.root - right.root || left.at - right.at)
      .map(({ id }) => id);
  }

  private *idsFrom({
    after = false,
    group = null,
    start = null,
  }: IdsFrom): Generator<string> {
    const order = this.ordered();
    const anchor = start === null ? null : getDefined(this.entries.get(start));
    const card = group === null ? null : this.entries.get(group);

    if (group !== null && !card) return;
    for (const [rootAt, book] of order.entries()) {
      if (card && card.slot.book !== book) continue;
      if (anchor && order.indexOf(anchor.slot.book) > rootAt) continue;

      const [from, to] = card
        ? cardRun(book, card)
        : [0, book.slots.total(ENTRIES)];
      const begin =
        anchor && anchor.slot.book === book
          ? entryIndex(book, anchor) + (after ? 1 : 0)
          : from;

      if (card && (begin < from || begin > to)) return;
      for (const entry of walkEntries(book, Math.max(begin, from), to)) {
        yield entry.id;
      }
    }
  }

  private members(id: string): readonly CardEntry[] {
    const entry = this.entries.get(id);

    if (!entry) return [];

    const [from, to] = cardRun(entry.slot.book, entry);

    return [...walkEntries(entry.slot.book, from, to)];
  }

  private occurrences(id: string): readonly Occurrence[] {
    return [...this.roots.values()].flatMap((book) =>
      this.holding.get(id)?.has(book) ? book.occurrences(id) : []
    );
  }

  private change(id: string): AuthoredChange | null {
    let change = this.read.changes.get(id);

    if (change === undefined) {
      const list = this.occurrences(id);

      change = list.length > 0 ? changeOf(id, list) : null;
      this.read.changes.set(id, change);
    }

    return change;
  }
}
