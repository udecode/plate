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
import { readMembers } from '../tree/marks';
import type { AuthoredChange, AuthoredChangeGroup } from '../types';
import {
  type CardEntry,
  type ChangePlaces,
  cardOf,
  cardRun,
  ENTRIES,
  entryIndex,
  MEASURES,
  SLOT_OLDEST,
  syncCards,
  UNITS,
  walkEntries,
} from './cards';
import { contentRootsOf, type Roots, sameRoots } from './roots';
import { blockFactsOf } from './runs';
import { type Slot, SlotTree } from './slots';
import { countLedgerWork } from './work';

type BlockChanges = Readonly<{
  /**
   * Every incarnation the block names, decided or not: its claims, held
   * deletions, followed joins and its contexts' members. A verdict changes
   * what the block holds only when it names one of them.
   */
  incarnations: readonly string[];
  occurrences: ReadonlyMap<string, readonly BlockOccurrence[]>;
  units: number;
}>;

/** @internal */
export type BookSlot = Slot & {
  block: JsonNode;
  book: RootBook;
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
  const { occurrences, units } = blockOccurrencesOf(block, (node) => {
    if (!marked) return [];
    namedBy(node, facts, named);

    return marksOf(node, facts);
  });

  return { incarnations: [...named], occurrences, units };
};

/** @internal */
export class RootBook {
  readonly holders = new Map<string, Set<BookSlot>>();
  private readonly naming = new Map<string, Set<BookSlot>>();
  readonly slots: SlotTree<BookSlot, CardEntry>;
  readonly root: string;
  private stored: DocumentIndex;

  constructor(
    root: string,
    stored: DocumentIndex,
    changesOf: (block: JsonNode) => BlockChanges,
    touched: Set<string>
  ) {
    this.root = root;
    this.stored = stored;
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

    for (const slot of slots) this.hold(slot, true, touched);

    return new SlotTree<BookSlot, CardEntry>(MEASURES, slots, SLOT_OLDEST);
  }

  private hold(slot: BookSlot, add: boolean, touched: Set<string>) {
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
    this.holdChanges(slot, add, touched);
  }

  private holdChanges(slot: BookSlot, add: boolean, touched: Set<string>) {
    for (const id of slot.changes.occurrences.keys()) {
      const holders = this.holders.get(id) ?? new Set<BookSlot>();

      touched.add(id);
      if (add) {
        holders.add(slot);
        this.holders.set(id, holders);
      } else {
        holders.delete(slot);
        if (holders.size === 0) this.holders.delete(id);
      }
    }
  }

  sync(
    stored: DocumentIndex,
    changesOf: (block: JsonNode) => BlockChanges,
    touched: Set<string>,
    spliced: Array<Readonly<{ book: RootBook; rank: number }>>
  ) {
    if (stored === this.stored) return;

    const ranges = this.stored.changedChildren(stored);

    for (let next = ranges.length - 1; next >= 0; next -= 1) {
      const [fromA, toA, fromB, toB] = getDefined(ranges[next]);
      const inserted = stored.nodes
        .slice(fromB, toB)
        .map((block) => slotOf(block, changesOf, this));

      spliced.push({ book: this, rank: fromB });

      this.slots.forEach(fromA, toA, (slot) => this.hold(slot, false, touched));
      for (const slot of inserted) this.hold(slot, true, touched);
      this.slots.splice(fromA, toA - fromA, inserted);
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

  reread(
    incarnations: Iterable<string>,
    changesOf: (block: JsonNode) => BlockChanges,
    touched: Set<string>
  ) {
    const slots = this.slotsNaming(incarnations);

    for (const slot of slots) {
      this.holdChanges(slot, false, touched);
      slot.changes = changesOf(slot.block);
      this.holdChanges(slot, true, touched);
    }
    countLedgerWork('bookEntries', slots.size);
  }

  occurrences(id: string): Occurrence[] {
    const holders = this.holders.get(id);

    if (!holders) return [];

    return [...holders]
      .map((slot) => ({ rank: this.slots.rankOf(slot), slot }))
      .sort((left, right) => left.rank - right.rank)
      .flatMap(({ rank, slot }) => {
        const before = this.slots.sumBefore(rank, UNITS);

        return getDefined(slot.changes.occurrences.get(id)).map((local) =>
          placeOccurrence(local, this.root, rank, before)
        );
      });
  }

  /** The holder of `id` with the least rank, or the greatest. */
  edgeHolder(id: string, last: boolean): BookSlot {
    let edge: BookSlot | null = null;
    let rank = 0;

    for (const slot of getDefined(this.holders.get(id))) {
      const at = this.slots.rankOf(slot);

      if (!edge || (last ? at > rank : at < rank)) {
        rank = at;
        edge = slot;
      }
    }

    return getDefined(edge);
  }

  firstPlace(id: string): Readonly<{ order: number; rank: number }> | null {
    const holders = this.holders.get(id);

    if (!holders) return null;

    let first: BookSlot | null = null;
    let rank = Number.POSITIVE_INFINITY;

    for (const slot of holders) {
      const at = this.slots.rankOf(slot);

      if (at < rank) {
        rank = at;
        first = slot;
      }
    }

    return {
      order: [...getDefined(first).changes.occurrences.keys()].indexOf(id),
      rank,
    };
  }
}

const slotOf = (
  block: JsonNode,
  changesOf: (block: JsonNode) => BlockChanges,
  book: RootBook
): BookSlot => {
  const changes = changesOf(block);

  return {
    block,
    book,
    changes,
    entries: [],
    leaf: null,
    measures: [changes.units, 0, 0, 0],
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
  blocks: ReadonlyArray<Readonly<{ rank: number; root: string }>>;
  changed: readonly string[];
  groups: readonly string[];
  removed: readonly string[];
}>;

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
  change: (id: string) => AuthoredChange | null;
  groupOf: (id: string) => AuthoredChangeGroup | null;
  has: (id: string) => boolean;
  idsFrom: (from: IdsFrom) => Generator<string>;
  idsIn: (root: string, from: number, to: number) => Set<string>;
  pendingInOrder: (ids: Iterable<string>) => string[];
  members: (id: string) => readonly CardEntry[];
  occurrences: (id: string) => readonly Occurrence[];
  ranksNaming: (
    incarnations: readonly string[]
  ) => Map<string, readonly number[]>;
}>;

const EMPTY_DELTA: BookDelta = Object.freeze({
  blocks: [],
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
  private readonly blocks = new WeakMap<
    JsonNode,
    Readonly<{ changes: BlockChanges; verdicts: readonly VerdictRead[] }>
  >();
  private published: {
    cards: Map<string, number>;
    delta: BookDelta;
    revisions: Map<string, number>;
    subscribers: number;
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
      for (const id of getDefined(this.roots.get(root)).holders.keys()) {
        touched.add(id);
      }
      this.roots.delete(root);
    }

    const roots = new Map<string, RootBook>();
    const spliced: Array<Readonly<{ book: RootBook; rank: number }>> = [];

    for (const [root, index] of content) {
      const book = this.roots.get(root);

      if (book) book.sync(index, this.changesOf, touched, spliced);
      roots.set(
        root,
        book ?? new RootBook(root, index, this.changesOf, touched)
      );
    }
    this.roots.clear();
    for (const [root, book] of roots) this.roots.set(root, book);
    // A verdict changes what the blocks naming its incarnation hold.
    if (this.verdicts !== undefined && verdicts !== this.verdicts) {
      const decided = verdictIncarnationsOf(
        recordSetChanges(this.verdicts, verdicts)
      );

      for (const book of this.roots.values()) {
        book.reread(decided, this.changesOf, touched);
      }
    }
    this.verdicts = verdicts;
    this.records = records;
    this.stored = content;
    this.read = { changes: new Map() };
    const cards = syncCards(
      this.entries,
      touched,
      spliced,
      (id) => this.change(id),
      (id) => this.placesOf(id)
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

    return this.view();
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
      change: fresh((id: string) => this.change(id)),
      groupOf: fresh((id: string) => this.groupOf(id)),
      has: fresh((id: string) => this.entries.has(id)),
      idsFrom: fresh((from: IdsFrom) => this.idsFrom(from)),
      idsIn: fresh((root: string, from: number, to: number) =>
        this.idsIn(root, from, to)
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

  subscribe() {
    if (this.published) {
      this.published.subscribers += 1;
      return;
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
    this.published = { cards, delta: EMPTY_DELTA, revisions, subscribers: 1 };
    this.unpublished = { ended: new Set(), entries: new Set(), ids: new Set() };
  }

  unsubscribe() {
    const published = getDefined(this.published);

    published.subscribers -= 1;
    if (published.subscribers === 0) this.published = null;
  }

  /**
   * What the syncs since the last publication changed, or the last delta when
   * nothing synced since, so every view of one commit reads the same delta.
   * A card is walked only when a member's card id differs from the one last
   * published for it, so a key that keeps a card's members together walks
   * nothing.
   */
  publish(): BookDelta {
    const published = getDefined(this.published);
    const { ended, entries, ids } = this.unpublished;

    if (ids.size === 0 && entries.size === 0 && ended.size === 0) {
      return published.delta;
    }

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
    const blocks = new Map<string, Readonly<{ rank: number; root: string }>>();

    for (const entry of entries) {
      if (this.entries.get(entry.id) !== entry) continue;

      const { book } = entry.slot;
      const card = cardOf(book, entry);

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
      for (const member of walkEntries(book, ...cardRun(book, entry))) {
        countLedgerWork('cardWalks');
        if (member.published === card.id) continue;
        // A new member's own blocks changed, so only older members add theirs.
        if (member.published !== undefined) {
          ended.add(member.published);
          for (const block of this.blocksOf(member.id)) {
            blocks.set(`${block.root}:${block.rank}`, block);
          }
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
    published.delta = Object.freeze({
      blocks: Object.freeze([...blocks.values()]),
      changed: Object.freeze(changed),
      groups: Object.freeze([...groups]),
      removed: Object.freeze(removed),
    });
    this.unpublished = { ended: new Set(), entries: new Set(), ids: new Set() };

    return published.delta;
  }

  private *blocksOf(id: string) {
    for (const book of this.roots.values()) {
      for (const slot of book.holders.get(id) ?? []) {
        yield { rank: book.slots.rankOf(slot), root: book.root };
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

  private placesOf(id: string): ChangePlaces {
    const books = [...this.roots.values()].filter((book) =>
      book.holders.has(id)
    );
    const first = getDefined(books[0]);
    const last = getDefined(books.at(-1));

    return {
      first: { book: first, slot: first.edgeHolder(id, false) },
      last: { book: last, slot: last.edgeHolder(id, true) },
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
    return [...this.roots.values()].flatMap((book) => book.occurrences(id));
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
