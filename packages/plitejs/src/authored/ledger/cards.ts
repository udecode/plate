import { getDefined } from '../../internal/get-defined';
import { type BlockOccurrence, continues, placeOccurrence } from '../changes';
import type { AuthoredChange, AuthoredChangeGroup } from '../types';
import type { BookSlot, RootBook } from './book';
import { countLedgerWork } from './work';

export const UNITS = 0;
export const ENTRIES = 1;
const STARTS = 2;
const SHARES = 3;
export const MEASURES = 4;

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

/** @internal */
export const entryIndex = (book: RootBook, entry: CardEntry) =>
  book.slots.sumBefore(book.slots.rankOf(entry.slot), ENTRIES) +
  entry.slot.entries.indexOf(entry);

const entryAt = (book: RootBook, index: number) => {
  const rank = book.slots.search(ENTRIES, index, false);

  return getDefined(
    book.slots.at(rank).entries[index - book.slots.sumBefore(rank, ENTRIES)]
  );
};

const measure = (book: RootBook, slot: BookSlot) => {
  let starts = 0;
  let shares = 0;
  let oldest: CardEntry | null = null;

  for (const entry of slot.entries) {
    if (entry.starts) starts += 1;
    shares += entry.share;
    if (!oldest || olderEntry(entry, oldest)) oldest = entry;
  }
  slot.measures[ENTRIES] = slot.entries.length;
  slot.measures[STARTS] = starts;
  slot.measures[SHARES] = shares;
  slot.oldest = oldest;
  if (slot.leaf) book.slots.update(slot);
};

/**
 * Where a pending change shows first and last, each in the root and block
 * the kernel's occurrence list starts and ends in.
 *
 * @internal
 */
export type ChangePlaces = Readonly<{ first: Place; last: Place }>;

/**
 * Move the entries of `touched` changes, then set the start bit again on the
 * entries whose previous change or own place may have moved: every entry of
 * a block whose entries changed, the entry after such a block, and the entry
 * at each block a sync spliced in or out. Returns those entries as `checked`,
 * the entry just before each such block, whose card may have lost a member,
 * as `near`, and the entries of changes that left as `removed`.
 *
 * @internal
 */
export const syncCards = (
  entries: Map<string, CardEntry>,
  touched: Iterable<string>,
  spliced: Iterable<Readonly<{ book: RootBook; rank: number }>>,
  changeOf: (id: string) => AuthoredChange | null,
  placesOf: (id: string) => ChangePlaces
) => {
  const dirty = new Map<BookSlot, RootBook>();
  const removed: CardEntry[] = [];

  for (const id of touched) {
    const old = entries.get(id);

    if (old) {
      old.slot.entries.splice(old.slot.entries.indexOf(old), 1);
      if (old.slot.leaf) dirty.set(old.slot, old.slot.book);
      entries.delete(id);
    }

    const change = changeOf(id);

    if (!change) {
      if (old) removed.push(old);
      continue;
    }

    const { first, last } = placesOf(id);
    const entry: CardEntry = {
      authorId: change.authorId,
      createdAt: change.createdAt,
      id,
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
  let left = nth - book.slots.sumBefore(rank, STARTS);
  const list = book.slots.at(rank).entries;

  for (const [local, entry] of list.entries()) {
    if (entry.starts) {
      if (left === 0) return book.slots.sumBefore(rank, ENTRIES) + local;
      left -= 1;
    }
  }

  throw new Error('A start count misses its slot.');
};

const sharesBefore = (book: RootBook, index: number) => {
  if (index >= book.slots.total(ENTRIES)) return book.slots.total(SHARES);

  const rank = book.slots.search(ENTRIES, index, false);
  const local = index - book.slots.sumBefore(rank, ENTRIES);

  return (
    book.slots.sumBefore(rank, SHARES) +
    book.slots
      .at(rank)
      .entries.slice(0, local)
      .reduce((sum, entry) => sum + entry.share, 0)
  );
};

/**
 * The entries of `entry`'s card, from its first index to the index after
 * its last.
 *
 * @internal
 */
export const cardRun = (book: RootBook, entry: CardEntry) => {
  const rank = book.slots.rankOf(entry.slot);
  const local = entry.slot.entries.indexOf(entry);
  const nth =
    book.slots.sumBefore(rank, STARTS) +
    entry.slot.entries.slice(0, local + 1).filter((item) => item.starts).length;

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
      yield getDefined(entries[local]);
      index += 1;
    }
  }
}

const oldestIn = (book: RootBook, from: number, to: number) => {
  const first = book.slots.search(ENTRIES, from, false);
  const last = book.slots.search(ENTRIES, to - 1, false);
  const candidates = [
    ...walkEntries(
      book,
      from,
      Math.min(to, book.slots.sumBefore(first + 1, ENTRIES))
    ),
  ];

  if (last > first) {
    const middle = book.slots.leastIn(first + 1, last)?.oldest;

    if (middle) candidates.push(middle);
    candidates.push(
      ...walkEntries(book, book.slots.sumBefore(last, ENTRIES), to)
    );
  }

  return candidates.reduce((oldest, entry) =>
    olderEntry(entry, oldest) ? entry : oldest
  );
};

/**
 * The summary of `entry`'s card: its oldest change names it, and its
 * revision changes when a change joins or leaves it or a member's revision
 * changes.
 *
 * @internal
 */
export const cardOf = (
  book: RootBook,
  entry: CardEntry
): AuthoredChangeGroup => {
  countLedgerWork('groups');

  const [from, to] = cardRun(book, entry);
  const oldest = oldestIn(book, from, to);
  const shares = sharesBefore(book, to) - sharesBefore(book, from);
  const changeCount = to - from;

  return Object.freeze({
    authorId: entry.authorId,
    changeCount,
    createdAt: oldest.createdAt,
    id: oldest.id,
    revision:
      Math.imul((shares % 0x1_00_00_00_00) ^ changeCount, 0x01_00_01_93) >>> 0,
  });
};
