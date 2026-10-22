import { getDefined } from '../../internal/get-defined';
import { type BlockOccurrence, continues, placeOccurrence } from '../changes';
import type { AuthoredChangeGroup } from '../types';
import type { BookSlot, RootBook } from './book';
import { countLedgerWork } from './work';

export const UNITS = 0;
export const ENTRIES = 1;
const STARTS = 2;
const SHARES = 3;
export const TOKENS = 4;
export const MEASURES = 5;

const SHARE_MASK = 0x1f_ff_ff;

/**
 * A pending change in the card sequence, kept in the slot of the block that
 * shows it first, in the order the kernel folds changes into cards.
 *
 * @internal
 */
export type CardEntry = {
  authorId: string;
  createdAt: number;
  readonly id: string;
  /** Its place among its slot's entries, set each time the slot is measured. */
  index: number;
  last: Readonly<{ book: RootBook; slot: BookSlot }>;
  /**
   * The card id last published for this change, carried over when a sync
   * recreates the entry, so publication sees which members changed card.
   */
  published: string | undefined;
  revision: number;
  /** Its part of its card's revision, so a card's revision is a sum. */
  share: number;
  slot: BookSlot;
  /** Whether a card starts here: the kernel starts one at this change. */
  starts: boolean;
};

export const olderEntry = (left: CardEntry, right: CardEntry) =>
  left.createdAt < right.createdAt ||
  (left.createdAt === right.createdAt && left.id < right.id);

export const SLOT_OLDEST = {
  before: olderEntry,
  of: (slot: BookSlot) => slot.oldest,
} as const;

type Place = Readonly<{ book: RootBook; slot: BookSlot }>;

const placeIn = ({ book, slot }: Place, local: BlockOccurrence | undefined) => {
  const rank = book.slots.rankOf(slot);

  return placeOccurrence(
    getDefined(local),
    book.root,
    rank,
    book.slots.sumBefore(rank, UNITS)
  );
};

const startsAfter = (book: RootBook, previous: CardEntry, entry: CardEntry) => {
  if (previous.authorId !== entry.authorId || previous.last.book !== book) {
    return true;
  }
  // A change touches only the next one in its block or the next top-level
  // block, so a gap of a block or more needs no occurrence.
  if (
    book.slots.rankOf(entry.slot) - book.slots.rankOf(previous.last.slot) >
    1
  ) {
    return true;
  }
  countLedgerWork('cardPairs');

  return !continues(
    placeIn(previous.last, previous.last.slot.changes.ends.get(previous.id)),
    placeIn(
      { book, slot: entry.slot },
      entry.slot.changes.occurrences.get(entry.id)?.[0]
    )
  );
};

/**
 * What a slot's measure keeps of its entries, so a card's run, shares and
 * oldest change read a cell per slot instead of walking its entries.
 *
 * @internal
 */
export type SlotCards = Readonly<{
  /** For each entry, the oldest entry since its card's start or the slot's. */
  oldest: readonly CardEntry[];
  /** The shares of the entries before each index. */
  shares: readonly number[];
  /** The starts among the entries before each index. */
  startCounts: readonly number[];
  /** The index of each entry a card starts at. */
  starts: readonly number[];
}>;

/** @internal */
export const NO_SLOT_CARDS: SlotCards = Object.freeze({
  oldest: [],
  shares: [0],
  startCounts: [0],
  starts: [],
});

/** @internal */
export const entryIndex = (book: RootBook, entry: CardEntry) =>
  book.slots.sumBefore(book.slots.rankOf(entry.slot), ENTRIES) + entry.index;

const entryAt = (book: RootBook, index: number) => {
  const rank = book.slots.search(ENTRIES, index, false);

  return getDefined(
    book.slots.at(rank).entries[index - book.slots.sumBefore(rank, ENTRIES)]
  );
};

const measure = (book: RootBook, slot: BookSlot) => {
  const oldest: CardEntry[] = [];
  const shares = [0];
  const startCounts = [0];
  const starts: number[] = [];
  let since: CardEntry | null = null;
  let least: CardEntry | null = null;

  for (const [index, entry] of slot.entries.entries()) {
    entry.index = index;
    if (entry.starts) starts.push(index);
    since = entry.starts || !since || olderEntry(entry, since) ? entry : since;
    if (!least || olderEntry(entry, least)) least = entry;
    oldest.push(since);
    shares.push(getDefined(shares.at(-1)) + entry.share);
    startCounts.push(starts.length);
  }
  slot.measures[ENTRIES] = slot.entries.length;
  slot.measures[STARTS] = starts.length;
  slot.measures[SHARES] = getDefined(shares.at(-1));
  slot.cards = { oldest, shares, startCounts, starts };
  slot.oldest = least;
  if (slot.leaf) book.slots.update(slot);
};

/**
 * What the card sequence reads of a pending change: its author, oldest mark
 * and revision, and where it shows first and last, each in the root and block
 * the kernel's occurrence list starts and ends in.
 *
 * @internal
 */
export type ChangeSummary = Readonly<{
  authorId: string;
  createdAt: number;
  first: Place;
  last: Place;
  revision: number;
}>;

/**
 * Move the entries of `touched` changes, then set the start bit again on the
 * entries whose previous change or own place may have moved: every entry of
 * a block whose entries changed, the entry after such a block, and the entry
 * at each block a sync spliced in or out. A `rechecked` block, one a sync
 * replaced in place, counts as one whose entries changed. Returns those
 * entries as `checked`, the entry just before each such block, whose card may
 * have lost a member, as `near`, and the entries of changes that left as
 * `removed`.
 *
 * @internal
 */
export const syncCards = (
  entries: Map<string, CardEntry>,
  touched: Iterable<string>,
  spliced: Iterable<Readonly<{ book: RootBook; rank: number }>>,
  rechecked: ReadonlyMap<BookSlot, RootBook>,
  summaryOf: (id: string) => ChangeSummary | null
) => {
  const dirty = new Map<BookSlot, RootBook>();

  for (const [slot, book] of rechecked) {
    if (slot.leaf) dirty.set(slot, book);
  }
  const removed: CardEntry[] = [];

  for (const id of touched) {
    const old = entries.get(id);

    if (old) {
      old.slot.entries.splice(old.slot.entries.indexOf(old), 1);
      if (old.slot.leaf) dirty.set(old.slot, old.slot.book);
      entries.delete(id);
    }

    const change = summaryOf(id);

    if (!change) {
      if (old) removed.push(old);
      continue;
    }

    const { first, last } = change;
    const entry: CardEntry = {
      authorId: change.authorId,
      createdAt: change.createdAt,
      id,
      index: 0,
      last,
      published: old?.published,
      revision: change.revision,
      share: change.revision & SHARE_MASK,
      slot: first.slot,
      starts: true,
    };

    first.slot.entries.push(entry);
    dirty.set(first.slot, first.book);
    entries.set(id, entry);
  }

  const checked = new Set<CardEntry>();

  for (const [slot, book] of dirty) {
    const order = new Map(
      [...slot.changes.occurrences.keys()].map((id, at) => [id, at])
    );

    slot.entries.sort(
      (left, right) =>
        getDefined(order.get(left.id)) - getDefined(order.get(right.id))
    );
    measure(book, slot);
  }

  const check = (book: RootBook, index: number) => {
    if (index < book.slots.total(ENTRIES)) {
      checked.add(entryAt(book, index));
    }
  };
  const near: CardEntry[] = [];
  const before = (book: RootBook, index: number) => {
    if (index > 0) near.push(entryAt(book, index - 1));
  };

  for (const [slot, book] of dirty) {
    const rank = book.slots.rankOf(slot);

    for (const entry of slot.entries) checked.add(entry);
    check(book, book.slots.sumBefore(rank + 1, ENTRIES));
    before(book, book.slots.sumBefore(rank, ENTRIES));
  }
  for (const { book, rank } of spliced) {
    check(book, book.slots.sumBefore(rank, ENTRIES));
    before(book, book.slots.sumBefore(rank, ENTRIES));
  }

  const flipped = new Map<BookSlot, RootBook>();

  for (const entry of checked) {
    const { book } = entry.slot;
    const index = entryIndex(book, entry);
    const starts =
      index === 0 || startsAfter(book, entryAt(book, index - 1), entry);

    if (starts !== entry.starts) {
      entry.starts = starts;
      flipped.set(entry.slot, book);
    }
  }
  for (const [slot, book] of flipped) measure(book, slot);

  return { checked, near, removed };
};

const startAt = (book: RootBook, nth: number) => {
  if (nth >= book.slots.total(STARTS)) return book.slots.total(ENTRIES);

  const rank = book.slots.search(STARTS, nth, false);

  return (
    book.slots.sumBefore(rank, ENTRIES) +
    getDefined(
      book.slots.at(rank).cards.starts[nth - book.slots.sumBefore(rank, STARTS)]
    )
  );
};

const sharesBefore = (book: RootBook, index: number) => {
  if (index >= book.slots.total(ENTRIES)) return book.slots.total(SHARES);

  const rank = book.slots.search(ENTRIES, index, false);

  return (
    book.slots.sumBefore(rank, SHARES) +
    getDefined(
      book.slots.at(rank).cards.shares[
        index - book.slots.sumBefore(rank, ENTRIES)
      ]
    )
  );
};

/**
 * The entries of `entry`'s card, from its first index to the index after
 * its last.
 *
 * @internal
 */
export const cardRun = (book: RootBook, entry: CardEntry) => {
  const nth =
    book.slots.sumBefore(book.slots.rankOf(entry.slot), STARTS) +
    getDefined(entry.slot.cards.startCounts[entry.index + 1]);

  return [startAt(book, nth - 1), startAt(book, nth)] as const;
};

export function* walkEntries(book: RootBook, from: number, to: number) {
  let index = from;

  while (index < to) {
    const rank = book.slots.search(ENTRIES, index, false);

    if (rank >= book.slots.size) return;

    const { entries } = book.slots.at(rank);

    for (
      let local = index - book.slots.sumBefore(rank, ENTRIES);
      local < entries.length && index < to;
      local += 1
    ) {
      countLedgerWork('entriesScanned');
      yield getDefined(entries[local]);
      index += 1;
    }
  }
}

// A card starts at `from`, so the last slot's cell holds its oldest entry
// there, and the first slot's last cell its oldest in that slot.
const oldestIn = (book: RootBook, from: number, to: number) => {
  const first = book.slots.search(ENTRIES, from, false);
  const last = book.slots.search(ENTRIES, to - 1, false);
  const cell = (rank: number, index: number) =>
    getDefined(
      book.slots.at(rank).cards.oldest[
        index - book.slots.sumBefore(rank, ENTRIES)
      ]
    );
  let oldest = cell(last, to - 1);

  if (last > first) {
    const middle = book.slots.leastIn(first + 1, last)?.oldest;

    for (const entry of [
      cell(first, book.slots.sumBefore(first + 1, ENTRIES) - 1),
      middle,
    ]) {
      if (entry && olderEntry(entry, oldest)) oldest = entry;
    }
  }

  return oldest;
};

/**
 * The summary of the card that holds the entries from `from` to `to` of
 * `book`, a run `cardRun` gave.
 *
 * @internal
 */
export const cardIn = (
  book: RootBook,
  authorId: string,
  from: number,
  to: number
): AuthoredChangeGroup => {
  countLedgerWork('cardSummaries');

  const oldest = oldestIn(book, from, to);
  const shares = sharesBefore(book, to) - sharesBefore(book, from);
  const changeCount = to - from;

  return Object.freeze({
    authorId,
    changeCount,
    createdAt: oldest.createdAt,
    id: oldest.id,
    revision:
      Math.imul((shares % 0x1_00_00_00_00) ^ changeCount, 0x01_00_01_93) >>> 0,
  });
};

/**
 * The summary of `entry`'s card: its oldest change names it, and its
 * revision changes when a change joins or leaves it or a member's revision
 * changes.
 *
 * @internal
 */
export const cardOf = (book: RootBook, entry: CardEntry) =>
  cardIn(book, entry.authorId, ...cardRun(book, entry));
