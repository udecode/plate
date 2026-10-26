import type { DocumentIndex } from '../../core/change/document-index';
import type { JsonNode } from '../../core/change/tokens';
import {
  getRecord,
  getRecordSetVersion,
  getValueRecords,
  type RecordSetVersion,
  recordSetChanges,
} from '../../core/record-store';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
import { documentRootsOf } from '../../core/unique-values';
import { countCoreWork } from '../../core/work';
import type { EditorDocumentValue } from '../../interfaces/editor';
import type { EditorJsonValue } from '../../interfaces/json';
import { getDefined } from '../../internal/get-defined';
import { factsOf, type ReviewFacts } from '../facts/facts';
import { incarnationOf, type ReserveRecord, RESERVES } from '../facts/records';
import { rootOf } from '../ledger/roots';
import { generatedOf } from './command-values';
import {
  type Counted,
  count,
  diffReads,
  type ElementRead,
  ElementReads,
  type Holder,
  type HolderKey,
  holderKeyPrefix,
  holdsNow,
  isPendingHolder,
  isPendingOwner,
  keyOfHolder,
  type Pending,
  pendingIn,
  shownOf,
} from './holders';

const MAIN = 'main';

/** The top-level block an element sits in, and its root. */
type Home = { block: JsonNode; readonly root: string };

/** What the record keeps of one generated value. */
type ValueSlot = {
  /** Its holders that hold another value of its key too. */
  readonly links: Counted<ElementRead>;
  /** The content roots other than the main one its holders sit in. */
  readonly roots: Counted<string>;
  /** The stored elements outside unbuilt spares that show it. */
  readonly showers: Counted<ElementRead>;
  /** How many of its holders are stuck. */
  stuck: number;
  /** How many elements store it, spares included. */
  storers: number;
  /** Its holders that are not stuck and wait on a mark. */
  readonly waiting: Counted<Holder>;
};

/** What the record keeps of one content root. */
type RootSlot = {
  /** The roots its owners sit in. */
  readonly from: Counted<string>;
  /** The roots the elements sitting in it own. */
  readonly owns: Counted<string>;
  /** How many of its owners are stuck. */
  stuck: number;
  /** The values its holders hold. */
  readonly values: Counted<HolderKey>;
  /** Its owners that are not stuck and wait on a mark. */
  readonly waiting: Counted<ElementRead>;
  /** Whether it waits, while known. */
  waits: boolean | null;
};

type SpareRecords = Readonly<{
  reads: ReadonlyMap<
    string,
    Readonly<{ json: string; read: ElementRead | null }>
  >;
  version: RecordSetVersion | null;
}>;

type State = Readonly<{
  generated: ReadonlyMap<string, unknown> | null;
  /** By top-level read, where it stands. */
  homes: Map<ElementRead, Home>;
  /** By root, the index the record reads it at. */
  positions: Map<string, DocumentIndex>;
  roots: Map<string, RootSlot>;
  showerHomes: Map<ElementRead, Home>;
  spares: { current: SpareRecords };
  values: Map<HolderKey, ValueSlot>;
  /** By incarnation, the reads whose standing or tags wait on it. */
  waitingOn: Map<string, Counted<ElementRead>>;
}>;

const NO_SPARES: SpareRecords = { reads: new Map(), version: null };

const emptyState = (generated: ReadonlyMap<string, unknown> | null): State => ({
  generated,
  homes: new Map(),
  positions: new Map(),
  roots: new Map(),
  showerHomes: new Map(),
  spares: { current: NO_SPARES },
  values: new Map(),
  waitingOn: new Map(),
});

/** A shower of a value whose group is ready, with where it stands. */
export type ReadyShower = Readonly<{
  at: HolderKey;
  key: string;
  shower: Readonly<{ block: JsonNode; node: JsonNode; root: string }>;
  value: EditorJsonValue;
}>;

/** What a judged move leaves to settle. */
export type Ready = Readonly<{
  candidates: readonly ReadyShower[];
  /** How many elements store the value `at` names. */
  storers: (at: HolderKey) => number;
}>;

type Moves = Readonly<{
  adds: ElementRead[];
  drops: Array<readonly [ElementRead, Home | undefined]>;
  pairs: Array<readonly [ElementRead, ElementRead, Home | undefined]>;
}>;

/**
 * Per generated value, what decides whether its group is ready: its stuck
 * holders counted, its waiting holders, the content roots its holders sit in,
 * its showers, its storers counted and its links; and per content root, its
 * owners. A move from one version of the document to another changes only
 * the slots of the reads the two do not share, and judges only the values
 * whose slots it changed, those a decided mark reaches and those of a root
 * whose owners stop waiting. Every change it makes inside a transaction is
 * undone when the transaction fails.
 */
export class ShownBook {
  private state: State = emptyState(null);
  private journal: Array<() => void> | null = null;
  private readonly dirty = new Set<HolderKey>();
  private readonly marked = new Set<string>();
  private home: Home | undefined;
  private readonly reads: ElementReads;

  constructor(reads = new ElementReads()) {
    this.reads = reads;
  }

  /**
   * Keeps what the next moves change undoable through `rollbacks`, which a
   * failed transaction runs; with none, the moves publish at once.
   */
  begin(rollbacks: Map<object, () => void> | undefined) {
    this.dirty.clear();
    this.marked.clear();
    if (!rollbacks) {
      this.journal = null;
      return;
    }
    if (rollbacks.has(this)) return;

    const journal: Array<() => void> = [];

    this.journal = journal;
    rollbacks.set(this, () => {
      for (let at = journal.length - 1; at >= 0; at -= 1) {
        getDefined(journal[at])();
      }
      journal.length = 0;
      if (this.journal === journal) this.journal = null;
    });
  }

  /**
   * Moves to `value` as `indexOf` holds its roots, then judges every value
   * the move or `decided`, the incarnations the commit decided, reaches.
   * Returns the showers of each ready group, or null.
   */
  ready(
    value: EditorDocumentValue,
    schema: CompiledEditorSchema,
    indexOf: (root: string) => DocumentIndex,
    decided: readonly string[]
  ): Ready | null {
    const generated = generatedOf(schema);

    if (generated.size === 0) return null;
    countCoreWork('shownSettles');

    const facts = factsOf(value);
    const fresh =
      this.state.positions.size === 0 || this.state.generated !== generated;

    this.move(value, schema, indexOf, generated, facts);
    // A record's first move judges every group with a shower, whatever the
    // move marked, so a fresh record reads the document whole.
    if (fresh) {
      for (const [at, slot] of this.state.values) {
        if (slot.showers.size > 0) this.dirty.add(at);
      }
    }
    for (const incarnation of decided) {
      for (const read of this.state.waitingOn.get(incarnation)?.keys() ?? []) {
        countCoreWork('decidedReads');
        for (const [at] of read.holders) this.dirty.add(at);
        for (const root of read.owns) this.marked.add(root);
      }
    }

    const pending = pendingIn(facts);

    this.judgeRoots(pending);

    const candidates = this.judge(pending);

    this.dirty.clear();

    return candidates.length === 0
      ? null
      : {
          candidates,
          storers: (at) => this.state.values.get(at)?.storers ?? 0,
        };
  }

  /**
   * Moves to `value`, an admitted document with no ready group left, outside
   * any transaction, so the first commit after a load moves from it.
   */
  load(value: EditorDocumentValue, schema: CompiledEditorSchema) {
    this.begin(undefined);
    this.settled(value, schema, (root) => rootOf(value, root));
  }

  /** Moves to `value`, as settled, judging no group. */
  settled(
    value: EditorDocumentValue,
    schema: CompiledEditorSchema,
    indexOf: (root: string) => DocumentIndex
  ) {
    const generated = generatedOf(schema);

    if (generated.size === 0) return;
    const facts = factsOf(value);

    this.move(value, schema, indexOf, generated, facts);
    this.judgeRoots(pendingIn(facts));
    this.dirty.clear();
  }

  fingerprint(value: EditorDocumentValue) {
    if (this.state.positions.size === 0) return null;

    const pending = pendingIn(factsOf(value));
    const sorted = <T>(items: Iterable<T>, text: (item: T) => string) =>
      [...items].map(text).sort();
    const counted = <T>(items: Counted<T>, text: (item: T) => string) =>
      sorted(items, ([item, times]) => `${text(item)}*${times}`);
    const own = (node: JsonNode) =>
      JSON.stringify({ ...node, children: undefined, text: undefined });
    const read = (at: ElementRead) => own(at.node);
    const holder = (at: Holder) =>
      JSON.stringify([
        at.holds,
        own(at.node),
        at.holds === 'restores'
          ? incarnationOf(at.tag)
          : at.standing.waitsOn.map(incarnationOf),
      ]);
    const values = [...this.state.values]
      .map(([at, slot]) => ({
        at,
        links: counted(slot.links, read),
        roots: counted(slot.roots, String),
        showers: counted(slot.showers, read),
        stuck: slot.stuck,
        storers: slot.storers,
        waiting: counted(slot.waiting, holder),
      }))
      .sort((left, right) => (left.at < right.at ? -1 : 1));
    const roots = [...this.state.roots]
      .map(([root, slot]) => ({
        from: counted(slot.from, String),
        owns: counted(slot.owns, String),
        root,
        stuck: slot.stuck,
        values: counted(slot.values, String),
        waiting: counted(slot.waiting, read),
        waits: this.rootWaits(root, pending),
      }))
      .sort((left, right) => (left.root < right.root ? -1 : 1));
    const waitingOn = sorted(
      this.state.waitingOn,
      ([incarnation, reads]) => `${incarnation}:${counted(reads, read)}`
    );
    const currentRankOf = ({ block, root }: Home) => {
      const index = this.state.positions.get(root);

      for (let rank = 0; rank < (index?.size ?? 0); rank += 1) {
        if (index?.child(rank) === block) return rank;
      }

      return -1;
    };
    const homes = (map: Map<ElementRead, Home>) =>
      sorted(map, ([at, home]) =>
        JSON.stringify([
          read(at),
          home.root,
          currentRankOf(home),
          own(home.block),
        ])
      );

    return JSON.stringify({
      homes: homes(this.state.homes),
      roots,
      showerHomes: homes(this.state.showerHomes),
      values,
      waitingOn,
    });
  }

  private undo(step: () => void) {
    this.journal?.push(step);
  }

  private tally<T>(counted: Counted<T>, item: T, by: 1 | -1) {
    count(counted, item, by);
    this.undo(() => count(counted, item, by === 1 ? -1 : 1));
  }

  private put<K, V>(map: Map<K, V>, key: K, value: V | undefined) {
    const had = map.has(key);
    const was = map.get(key);

    if (value === undefined) map.delete(key);
    else map.set(key, value);
    this.undo(() => {
      if (had) map.set(key, was as V);
      else map.delete(key);
    });
  }

  private valueSlot(at: HolderKey) {
    let slot = this.state.values.get(at);

    if (!slot) {
      slot = {
        links: new Map(),
        roots: new Map(),
        showers: new Map(),
        stuck: 0,
        storers: 0,
        waiting: new Map(),
      };
      this.put(this.state.values, at, slot);
    }

    return slot;
  }

  private rootSlot(root: string) {
    let slot = this.state.roots.get(root);

    if (!slot) {
      slot = {
        from: new Map(),
        owns: new Map(),
        stuck: 0,
        values: new Map(),
        waiting: new Map(),
        waits: null,
      };
      this.put(this.state.roots, root, slot);
    }

    return slot;
  }

  private bump<F extends string>(
    slot: Record<F, number>,
    field: F,
    by: 1 | -1
  ) {
    slot[field] += by;
    this.undo(() => {
      slot[field] -= by;
    });
  }

  private setWaits(slot: RootSlot, waits: boolean | null) {
    const was = slot.waits;

    if (was === waits) return;
    slot.waits = waits;
    this.undo(() => {
      slot.waits = was;
    });
  }

  private move(
    value: EditorDocumentValue,
    schema: CompiledEditorSchema,
    indexOf: (root: string) => DocumentIndex,
    generated: ReadonlyMap<string, unknown>,
    facts: ReviewFacts
  ) {
    this.reads.use({ contexts: facts, generated, schema });
    if (this.state.generated !== generated) {
      const was = this.state;

      this.state = emptyState(generated);
      this.undo(() => {
        this.state = was;
      });
    }

    const roots = documentRootsOf(value);
    const live = new Set(roots);

    for (const root of [...this.state.positions.keys()]) {
      if (!live.has(root)) this.moveRoot(root, null);
    }
    for (const root of roots) this.moveRoot(root, indexOf(root));
    this.moveSpares(value);
  }

  private moveRoot(root: string, index: DocumentIndex | null) {
    const { homes, positions } = this.state;
    const old = positions.get(root) ?? null;

    if (old === index) return;
    countCoreWork('holderRootMoves');

    const top = this.reads.top(false);
    const readOf = (at: DocumentIndex, rank: number) =>
      this.reads.of(getDefined(at.child(rank)), top);
    const moves: Moves = { adds: [], drops: [], pairs: [] };

    if (!old) {
      for (let rank = 0; rank < (index?.size ?? 0); rank += 1) {
        moves.adds.push(readOf(getDefined(index), rank));
      }
    } else if (!index) {
      for (let rank = 0; rank < old.size; rank += 1) {
        const read = readOf(old, rank);

        moves.drops.push([read, homes.get(read)]);
      }
    } else {
      for (const [fromA, toA, fromB, toB] of old.changedChildren(index)) {
        const paired = toA - fromA === toB - fromB;

        for (let rank = fromA; rank < toA; rank += 1) {
          const read = readOf(old, rank);

          if (paired) {
            moves.pairs.push([
              read,
              readOf(index, fromB + rank - fromA),
              homes.get(read),
            ]);
          } else {
            moves.drops.push([read, homes.get(read)]);
          }
        }
        if (paired) continue;
        for (let rank = fromB; rank < toB; rank += 1) {
          moves.adds.push(readOf(index, rank));
        }
      }
    }

    // A block can leave one rank and come back at another in one move, so
    // every home it leaves goes before any it takes.
    for (const [read] of moves.drops) this.put(homes, read, undefined);
    for (const [read] of moves.pairs) this.put(homes, read, undefined);
    for (const [, read, home] of moves.pairs) {
      const at = home ?? { block: read.node, root };

      if (home) {
        const was = home.block;

        home.block = read.node;
        this.undo(() => {
          home.block = was;
        });
      }
      this.put(homes, read, at);
    }

    const visit = {
      add: (read: ElementRead) => this.visit(read, root, 1),
      drop: (read: ElementRead) => this.visit(read, root, -1),
    };

    for (const [read, home] of moves.drops) {
      this.home = home;
      diffReads(read, null, visit);
    }
    for (const [before, after] of moves.pairs) {
      this.home = homes.get(after);
      diffReads(before, after, visit);
    }
    for (const read of moves.adds) {
      const home = { block: read.node, root };

      this.put(homes, read, home);
      this.home = home;
      diffReads(null, read, visit);
    }
    this.home = undefined;
    this.put(positions, root, index ?? undefined);
  }

  private moveSpares(value: EditorDocumentValue) {
    const store = getValueRecords(value);
    const version = getRecordSetVersion(store, RESERVES);
    const { spares } = this.state;
    const was = spares.current;

    if (was.version === version) return;

    const reads = new Map(was.reads);
    const visit = {
      add: (read: ElementRead) => this.visit(read, null, 1),
      drop: (read: ElementRead) => this.visit(read, null, -1),
    };
    for (const id of recordSetChanges(was.version, version)) {
      countCoreWork('spareRecordMoves');

      const old = reads.get(id);
      const json = getRecord(store, RESERVES, id);

      if (old?.json === json) continue;
      if (old?.read) diffReads(old.read, null, visit);
      if (json === undefined) {
        reads.delete(id);
        continue;
      }

      const record = JSON.parse(json) as ReserveRecord;
      const read = record.built
        ? null
        : this.reads.of(record.node, this.reads.top(true));

      if (read) diffReads(null, read, visit);
      reads.set(id, { json, read });
    }
    spares.current = { reads, version };
    this.undo(() => {
      spares.current = was;
    });
  }

  private visit(read: ElementRead, root: string | null, by: 1 | -1) {
    countCoreWork('shownReadMoves');

    const incarnations = new Set<string>();
    const rooted = root !== null && root !== MAIN;

    for (const [at, holder] of read.holders) {
      const slot = this.valueSlot(at);

      if (holder.holds === 'restores') {
        this.tally(slot.waiting, holder, by);
        incarnations.add(incarnationOf(holder.tag));
        if (by === -1) this.dirty.add(at);
        continue;
      }

      const { standing } = holder;

      if (standing.stuck) this.bump(slot, 'stuck', by);
      else if (standing.waitsOn.length > 0) {
        this.tally(slot.waiting, holder, by);
      }
      for (const mark of standing.waitsOn) {
        incarnations.add(incarnationOf(mark));
      }
      if (rooted) {
        this.tally(slot.roots, root, by);
        this.tally(this.rootSlot(root).values, at, by);
      }
      if (holder.holds === 'stores') this.bump(slot, 'storers', by);
      else if (read.shows) {
        this.tally(slot.showers, read, by);
        if (by === 1) this.dirty.add(at);
      }
      if (
        by === -1 &&
        (standing.stuck || standing.waitsOn.length > 0 || rooted)
      ) {
        this.dirty.add(at);
      }
    }
    for (const key of read.links) {
      const ofKey = holderKeyPrefix(key);

      for (const [at] of read.holders) {
        if (!at.startsWith(ofKey)) continue;
        this.tally(this.valueSlot(at).links, read, by);
        this.dirty.add(at);
      }
    }
    // A move can take a read in again before it lets the read go, as when a
    // sibling moves past it, so its home stays while any value counts it.
    if (read.shows) {
      if (by === 1) this.put(this.state.showerHomes, read, this.home);
      else if (
        !read.holders.some(([at]) =>
          this.state.values.get(at)?.showers.has(read)
        )
      ) {
        this.put(this.state.showerHomes, read, undefined);
      }
    }

    const { owner } = read;

    if (owner && root !== null) {
      for (const owned of read.owns) {
        const slot = this.rootSlot(owned);

        if (owner.stuck) this.bump(slot, 'stuck', by);
        else if (owner.waitsOn.length > 0) this.tally(slot.waiting, read, by);
        this.tally(slot.from, root, by);
        this.tally(this.rootSlot(root).owns, owned, by);
        this.marked.add(owned);
      }
      for (const mark of owner.waitsOn) incarnations.add(incarnationOf(mark));
    }
    for (const incarnation of incarnations) {
      let reads = this.state.waitingOn.get(incarnation);

      if (!reads) {
        reads = new Map();
        this.put(this.state.waitingOn, incarnation, reads);
      }
      this.tally(reads, read, by);
      if (reads.size === 0) {
        this.put(this.state.waitingOn, incarnation, undefined);
      }
    }
    if (by === 1) return;
    // A record outlives every value and root it has seen, so it keeps a slot
    // only while something is counted in it.
    for (const [at] of read.holders) {
      const slot = this.state.values.get(at);

      if (
        slot &&
        slot.links.size +
          slot.roots.size +
          slot.showers.size +
          slot.stuck +
          slot.storers +
          slot.waiting.size ===
          0
      ) {
        this.put(this.state.values, at, undefined);
      }
    }
    for (const at of root === null ? [] : [root, ...read.owns]) {
      const slot = this.state.roots.get(at);

      if (
        slot &&
        slot.from.size +
          slot.owns.size +
          slot.stuck +
          slot.values.size +
          slot.waiting.size ===
          0
      ) {
        this.put(this.state.roots, at, undefined);
      }
    }
  }

  /**
   * Settles again whether each marked root, and each root an element in one
   * of them owns, waits; a root that stops waiting reaches its values. A root
   * whose standing is unknown, such as one the record has not judged since a
   * load, may have waited.
   */
  private judgeRoots(pending: Pending) {
    if (this.marked.size === 0) return;

    const reached = [...this.marked];
    const seen = new Set(reached);
    const was = new Map<string, boolean | null>();

    this.marked.clear();
    // Visits the roots pushed while it runs.
    for (const root of reached) {
      countCoreWork('rootJudgments');

      const slot = this.state.roots.get(root);

      if (!slot) continue;
      was.set(root, slot.waits);
      this.setWaits(slot, null);
      for (const owned of slot.owns.keys()) {
        if (!seen.has(owned)) {
          seen.add(owned);
          reached.push(owned);
        }
      }
    }
    for (const [root, waited] of was) {
      if (waited === false || this.rootWaits(root, pending)) continue;
      for (const at of getDefined(this.state.roots.get(root)).values.keys()) {
        this.dirty.add(at);
      }
    }
  }

  /**
   * Whether `root` waits: an owner of it, or of a root an owner of it sits
   * in, up to the main root, is pending. Each root reached settles its
   * standing once; one reached again adds nothing, which ends a cycle.
   */
  private rootWaits(root: string, pending: Pending): boolean {
    if (root === MAIN) return false;

    const start = this.state.roots.get(root);

    if (!start) return false;
    if (start.waits !== null) return start.waits;

    const reached = [root];
    const seen = new Set(reached);

    // Visits the roots pushed while it runs.
    for (const at of reached) {
      const slot = this.state.roots.get(at);

      if (!slot) continue;
      if (
        slot.waits === true ||
        slot.stuck > 0 ||
        [...slot.waiting.keys()].some((owner) => {
          countCoreWork('ownerChecks');

          return isPendingOwner(getDefined(owner.owner), pending);
        })
      ) {
        this.setWaits(start, true);

        return true;
      }
      for (const from of slot.from.keys()) {
        if (
          from !== MAIN &&
          !seen.has(from) &&
          this.state.roots.get(from)?.waits !== false
        ) {
          seen.add(from);
          reached.push(from);
        }
      }
    }
    for (const at of reached) {
      const slot = this.state.roots.get(at);

      if (slot) this.setWaits(slot, false);
    }

    return false;
  }

  /**
   * The showers of each ready group a dirty value is in. A group search
   * follows links only, and stops at its first pending holder.
   */
  private judge(pending: Pending) {
    const judged = new Set<HolderKey>();
    const candidates: ReadyShower[] = [];
    const { values } = this.state;

    for (const from of this.dirty) {
      if (judged.has(from)) continue;

      const first = values.get(from);

      if (!first || (first.showers.size === 0 && first.links.size === 0)) {
        continue;
      }
      countCoreWork('valueGroupReads');

      const key = keyOfHolder(from);
      const ofKey = holderKeyPrefix(key);
      const ats = [from];
      const seen = new Set(ats);
      let waits = false;

      // Visits the values pushed while it runs.
      for (const at of ats) {
        countCoreWork('groupHolderVisits');

        const slot = getDefined(values.get(at));

        waits =
          slot.stuck > 0 ||
          [...slot.roots.keys()].some((root) => this.rootWaits(root, pending));
        for (const holder of waits ? [] : slot.waiting.keys()) {
          countCoreWork('groupHolderVisits');
          if (isPendingHolder(holder, pending)) {
            waits = true;
            break;
          }
        }
        if (waits) break;
        for (const read of slot.links.keys()) {
          countCoreWork('groupHolderVisits');
          if (!holdsHere(read, at, pending)) continue;
          for (const [other, holder] of read.holders) {
            if (
              other.startsWith(ofKey) &&
              !seen.has(other) &&
              holdsNow(holder, pending)
            ) {
              seen.add(other);
              ats.push(other);
            }
          }
        }
      }
      for (const at of seen) judged.add(at);
      if (waits) continue;
      for (const at of ats) {
        for (const read of getDefined(values.get(at)).showers.keys()) {
          const home = getDefined(this.state.showerHomes.get(read));

          candidates.push({
            at,
            key,
            shower: { block: home.block, node: read.node, root: home.root },
            value: getDefined(shownOf(read.node))[key],
          });
        }
      }
    }

    return candidates;
  }
}

const holdsHere = (read: ElementRead, at: HolderKey, pending: Pending) =>
  read.holders.some(
    ([held, holder]) => held === at && holdsNow(holder, pending)
  );
