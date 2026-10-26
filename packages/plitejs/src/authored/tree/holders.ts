import {
  type DocumentChange,
  getInternalDocumentChangeRecords,
  getInternalDocumentChangeRootKeys,
  getInternalDocumentRootChange,
} from '../../core/change/document-change';
import type { DocumentIndex } from '../../core/change/document-index';
import type { JsonNode } from '../../core/change/tokens';
import { canonicalJsonKey } from '../../core/change/transform';
import { ownedRootsOf } from '../../core/element-owned-root-index';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
import { countCoreWork } from '../../core/work';
import type { EditorDocumentValue } from '../../interfaces/editor';
import type { EditorJsonValue } from '../../interfaces/json';
import { getDefined } from '../../internal/get-defined';
import { isEditingChange } from '../facts/editing';
import {
  type ContextLookup,
  contextInsertsOf,
  decidedIn,
  type ReviewFacts,
  undecided,
} from '../facts/facts';
import { rootOf } from '../ledger/roots';
import { tagValues } from './holds';
import type { FormatTag } from './layers';
import {
  type AuthoredMark,
  readAuthoredMarks,
  readMembers,
  readRestsOn,
} from './marks';
import { sparesIn } from './spares';

/**
 * Whether a decision still to come can change what an element holds, read
 * from its own top-level block. `stuck`: a stored claim on it or an ancestor,
 * retained ones included, can still remove, move or rebuild it, or it sits in
 * an unbuilt spare, which a pending claim can still build; no verdict changes
 * that. `waitsOn`: every mark whose being undecided keeps it pending, the
 * insertions of the contexts it or an ancestor rests on, the type tags above
 * it and its own tags on the key and on its type. Editing's marks are always
 * accepted, so none is listed.
 */
export type Standing = Readonly<{
  stuck: boolean;
  waitsOn: readonly AuthoredMark[];
}>;

/**
 * Whether a commit from `before` through `change` to `value` leaves every
 * input of a group's readiness as it was, so every group that waited still
 * waits and the settle stage reads nothing. Each condition names the inputs
 * it guards, so an input added to {@link Standing}, the owners of a content
 * root or the place check needs its own condition here:
 *
 * - No changed range opens an element, on either side: an element's marks and
 *   ancestors give its {@link Standing}, its unbuilt spares their holders, its
 *   type and parents the place check, its `type` and `childRoots` the roots
 *   it owns, and its properties what it stores, shows and restores.
 * - No record is written: a verdict decides a mark of `waitsOn`, a context
 *   record lists the insertions `waitsOn` names, and a root spare record is a
 *   stuck holder.
 * - No root is created or deleted: a root no element owns goes with no
 *   element change, and with it the holders it keeps.
 * - It decides no incarnation, by {@link decidedIn}: an insertion count that
 *   changes sign turns a rejected format or deletion tag's outcome, and so
 *   whether a tag of `waitsOn` or a restoring tag is undecided, with no
 *   element or record changed.
 */
export const quietCommit = (
  value: EditorDocumentValue,
  {
    before,
    change,
    indexOf,
  }: Readonly<{
    before: EditorDocumentValue;
    change: DocumentChange;
    indexOf: (root: string) => DocumentIndex;
  }>
) => {
  for (const ops of getInternalDocumentChangeRecords(change).values()) {
    if (ops.size > 0) return false;
  }

  const roots = Object.keys(before.roots ?? {});
  const after = value.roots ?? {};

  if (
    roots.length !== Object.keys(after).length ||
    roots.some((root) => !Object.hasOwn(after, root))
  ) {
    return false;
  }

  const opens = (index: DocumentIndex, from: number, to: number) =>
    index
      .nodeRangesTouching(from, to)
      .some(
        (range) =>
          range.kind !== 'text' && range.from >= from && range.from < to
      );

  for (const root of getInternalDocumentChangeRootKeys(change)) {
    const rootChange = getInternalDocumentRootChange(change, root);

    if (!rootChange || rootChange.empty) continue;

    const was = rootOf(before, root);
    const now = indexOf(root);
    let quiet = true;

    rootChange.iterChangedRanges((fromA, toA, fromB, toB) => {
      quiet &&= !opens(now, fromB, toB) && !opens(was, fromA, toA);
    });
    if (!quiet) return false;
  }

  return decidedIn(before, value, change, indexOf).length === 0;
};

/** A {@link holderKey}: one value of one generated key. */
export type HolderKey = string;

/**
 * An element that holds a generated value of one key: as the value it
 * `stores`, as an `as` value it `shows`, or as a value its `tag` `restores`
 * once decided, which it holds, and waits on, only while the tag is undecided.
 */
export type Holder =
  | Readonly<{ holds: 'shows' | 'stores'; node: JsonNode; standing: Standing }>
  | Readonly<{ holds: 'restores'; node: JsonNode; tag: FormatTag }>;

const isText = (node: JsonNode) => typeof node.text === 'string';

/**
 * What every {@link holderKey} of `key` starts with. A property name can hold
 * a NUL, so it goes in as JSON, which escapes one.
 */
export const holderKeyPrefix = (key: string) => `${JSON.stringify(key)}\u0000`;

export const holderKey = (key: string, value: unknown): HolderKey =>
  `${holderKeyPrefix(key)}${canonicalJsonKey(value)}`;

export const keyOfHolder = (at: HolderKey): string =>
  JSON.parse(at.slice(0, at.indexOf('\u0000')));

/**
 * The values `node` shows under the proposed view, or null: each `as` member's
 * values, the first member in canonical set order winning a key.
 */
export const shownOf = (
  node: unknown
): Readonly<Record<string, EditorJsonValue>> | null => {
  let shown: Record<string, EditorJsonValue> | null = null;

  for (const member of readMembers(node)) {
    if (member.kind !== 'as') continue;
    shown ??= {};
    for (const [key, value] of Object.entries(member.values)) {
      if (!Object.hasOwn(shown, key)) shown[key] = value;
    }
  }

  return shown;
};

/** What a document leaves undecided, read only by mark. */
export type Pending = Readonly<{
  undecided: (mark: AuthoredMark) => boolean;
}>;

export const pendingIn = (facts: ReviewFacts): Pending => ({
  undecided: (mark) => undecided(facts, mark),
});

/** Whether `holder` holds its value while `pending` holds. */
export const holdsNow = (holder: Holder, pending: Pending) =>
  holder.holds !== 'restores' || pending.undecided(holder.tag);

export const stillHolds = (holders: Iterable<Holder>, pending: Pending) =>
  [...holders].filter((holder) => holdsNow(holder, pending));

/** Whether a decision still to come can change what `standing` stands for. */
const isPending = (standing: Standing, pending: Pending) =>
  standing.stuck || standing.waitsOn.some(pending.undecided);

/** Whether a decision still to come can change what `holder` holds. */
export const isPendingHolder = (holder: Holder, pending: Pending) =>
  holder.holds === 'restores'
    ? pending.undecided(holder.tag)
    : isPending(holder.standing, pending);

const claims = (node: JsonNode) =>
  readAuthoredMarks(node).some((mark) => mark.kind !== 'format');

const decidable = (mark: AuthoredMark) => !isEditingChange(mark.change);

/**
 * The standing an element gives what is below it in its block: a claim on it
 * or above it, the insertions its contexts and those above carry, the type
 * tags on it and above it, and whether the block is an unbuilt spare. Equal
 * standings are one object, so the reads under them are kept on it.
 */
export type Above = Readonly<{
  /** By what an element adds, the standing below it. */
  below: Map<string, Above>;
  claimed: boolean;
  /** Each element read under this standing. */
  reads: WeakMap<JsonNode, ElementRead>;
  spare: boolean;
  waitsOn: readonly AuthoredMark[];
}>;

const aboveOf = (
  claimed: boolean,
  spare: boolean,
  waitsOn: readonly AuthoredMark[]
): Above => ({
  below: new Map(),
  claimed,
  reads: new WeakMap(),
  spare,
  waitsOn,
});

/**
 * One element of a top-level block or an unbuilt spare, read under the
 * standing its ancestors give it, for the generated keys being read. An
 * element read again under the same standing is the same object.
 */
export type ElementRead = Readonly<{
  above: Above;
  children: readonly ElementRead[];
  /** Each value it holds, with its {@link holderKey}. */
  holders: ReadonlyArray<readonly [HolderKey, Holder]>;
  /** The keys of which it holds two values or more. */
  links: readonly string[];
  /** It, a text child or an element below it holds a review member. */
  marked: boolean;
  node: JsonNode;
  /**
   * The standing of what it owns, when it owns a content root: a claim on it
   * or above it, the insertions its contexts and those above carry, the type
   * tags on it and above it, and its own tags on its child roots.
   */
  owner: Standing | null;
  /** The content roots it owns; none in an unbuilt spare. */
  owns: readonly string[];
  /** It shows a value and sits in no unbuilt spare. */
  shows: boolean;
  /** The unbuilt spares it holds, each read as a spare. */
  spares: readonly ElementRead[];
}>;

const NO_READS: readonly ElementRead[] = Object.freeze([]);

const NO_ROOTS: readonly string[] = Object.freeze([]);

/**
 * What elements are read under: the schema, whose types declare the content
 * roots an element owns, its generated keys, and the context records the
 * contexts an element rests on name.
 */
export type HolderReading = Readonly<{
  contexts: ContextLookup;
  generated: ReadonlyMap<string, unknown>;
  schema: CompiledEditorSchema;
}>;

/**
 * Reads elements for the generated values they hold, once per element and
 * standing, so readers of two versions of a block share every unchanged
 * element's read.
 */
export class ElementReads {
  private generated: ReadonlyMap<string, unknown> | null = null;
  private keys: readonly string[] = [];
  private reading: HolderReading | null = null;
  private stored = aboveOf(false, false, []);
  private spare = aboveOf(false, true, []);

  /**
   * Reads as `reading` says from now on. Other generated keys, which another
   * schema has, read every element again.
   */
  use(reading: HolderReading) {
    this.reading = reading;
    if (reading.generated === this.generated) return;
    this.generated = reading.generated;
    this.keys = [...reading.generated.keys()];
    this.stored = aboveOf(false, false, []);
    this.spare = aboveOf(false, true, []);
  }

  /** The standing of a top-level block, or of an unbuilt spare's node. */
  top(spare: boolean): Above {
    return spare ? this.spare : this.stored;
  }

  of(node: JsonNode, above: Above): ElementRead {
    const known = above.reads.get(node);

    if (known) return known;
    countCoreWork('valueHolderReads');

    const reading = getDefined(this.reading);
    const marks = readAuthoredMarks(node);
    const claimed = above.claimed || claims(node);
    const rests = readRestsOn(node);
    const contexts = rests.flatMap(({ ctx }) =>
      contextInsertsOf(reading.contexts, ctx).filter(decidable)
    );
    const formats = marks.filter(
      (mark): mark is FormatTag => mark.kind === 'format' && decidable(mark)
    );
    const types = formats.filter((tag) => tag.key === 'type');
    const values = shownOf(node);
    const stuck = above.spare || claimed;
    const base =
      contexts.length === 0 ? above.waitsOn : [...above.waitsOn, ...contexts];
    const plain: Standing = {
      stuck,
      waitsOn: types.length === 0 ? base : [...base, ...types],
    };
    const holders: Array<readonly [HolderKey, Holder]> = [];
    const links: string[] = [];

    for (const key of this.keys) {
      const own = formats.filter((tag) => tag.key === key);
      const standing: Standing =
        own.length === 0
          ? plain
          : { stuck, waitsOn: [...plain.waitsOn, ...own] };
      const first = holders.length;
      const stored = node[key] === undefined ? null : holderKey(key, node[key]);

      if (stored) holders.push([stored, { holds: 'stores', node, standing }]);
      if (values && Object.hasOwn(values, key)) {
        holders.push([
          holderKey(key, values[key]),
          { holds: 'shows', node, standing },
        ]);
      }
      for (const tag of own) {
        for (const value of tagValues(tag)) {
          const at = holderKey(key, value);

          if (at !== stored) {
            holders.push([at, { holds: 'restores', node, tag }]);
          }
        }
      }
      if (new Set(holders.slice(first).map(([at]) => at)).size > 1) {
        links.push(key);
      }
    }

    const below = this.below(above, node, claimed, contexts, types);
    let marked = readMembers(node).length > 0;
    const children: ElementRead[] = [];

    for (const child of node.children ?? []) {
      if (isText(child)) {
        marked ||= readMembers(child).length > 0;
        continue;
      }

      const read = this.of(child, below);

      marked ||= read.marked;
      children.push(read);
    }

    const spares = above.spare
      ? NO_READS
      : sparesIn(node).flatMap((member) =>
          member.built ? [] : [this.of(member.node, this.spare)]
        );
    const owns = above.spare ? NO_ROOTS : ownedRootsOf(reading.schema, node);
    const read: ElementRead = {
      above,
      children,
      holders,
      links,
      marked,
      node,
      owner:
        owns.length === 0
          ? null
          : {
              stuck: claimed,
              waitsOn: [
                ...plain.waitsOn,
                ...formats.filter((tag) => tag.key === 'childRoots'),
              ],
            },
      owns,
      shows: !above.spare && values !== null,
      spares,
    };

    above.reads.set(node, read);

    return read;
  }

  private below(
    above: Above,
    node: JsonNode,
    claimed: boolean,
    contexts: readonly AuthoredMark[],
    types: readonly FormatTag[]
  ): Above {
    if (
      claimed === above.claimed &&
      contexts.length === 0 &&
      types.length === 0
    ) {
      return above;
    }

    const adds = JSON.stringify([
      claimed,
      readRestsOn(node).map(({ ctx }) => ctx),
      types.map(canonicalJsonKey),
    ]);
    let found = above.below.get(adds);

    if (!found) {
      found = aboveOf(claimed, above.spare, [
        ...above.waitsOn,
        ...contexts,
        ...types,
      ]);
      above.below.set(adds, found);
    }

    return found;
  }
}

/** What a reader does with each read a move takes in or lets go. */
export type ReadVisit = Readonly<{
  add: (read: ElementRead) => void;
  drop: (read: ElementRead) => void;
}>;

const diffLists = (
  before: readonly ElementRead[],
  after: readonly ElementRead[],
  visit: ReadVisit
) => {
  let start = 0;
  let endBefore = before.length;
  let endAfter = after.length;

  while (start < endBefore && start < endAfter) {
    countCoreWork('readChildScans');
    if (before[start] !== after[start]) break;
    start += 1;
  }
  while (endBefore > start && endAfter > start) {
    countCoreWork('readChildScans');
    if (before[endBefore - 1] !== after[endAfter - 1]) break;
    endBefore -= 1;
    endAfter -= 1;
  }
  if (endBefore === endAfter) {
    for (let at = start; at < endBefore; at += 1) {
      diffReads(before[at] ?? null, after[at] ?? null, visit);
    }
    return;
  }
  for (let at = start; at < endBefore; at += 1) {
    diffReads(before[at] ?? null, null, visit);
  }
  for (let at = start; at < endAfter; at += 1) {
    diffReads(null, after[at] ?? null, visit);
  }
};

/**
 * Visits each read `before` holds that `after` does not with `drop`, and each
 * read `after` holds new with `add`, going down only into reads that differ,
 * so an unchanged element costs one identity comparison.
 */
export const diffReads = (
  before: ElementRead | null,
  after: ElementRead | null,
  visit: ReadVisit
) => {
  if (before === after) return;
  if (before) visit.drop(before);
  if (after) visit.add(after);
  diffLists(before?.children ?? NO_READS, after?.children ?? NO_READS, visit);
  diffLists(before?.spares ?? NO_READS, after?.spares ?? NO_READS, visit);
};

/** How often each item stands. */
export type Counted<T> = Map<T, number>;

export const count = <T>(counted: Counted<T>, item: T, by: 1 | -1) => {
  const next = (counted.get(item) ?? 0) + by;

  if (next > 0) counted.set(item, next);
  else counted.delete(item);
};

type Held = Map<HolderKey, Counted<Holder>>;

type RootReads = {
  readonly holders: Held;
  index: DocumentIndex;
  /** Each top-level block holding a review member, with how often it stands. */
  readonly marked: Counted<JsonNode>;
};

const NO_HOLDERS: readonly Holder[] = Object.freeze([]);

/**
 * What one editor's stored document holds for its generated values, by root:
 * each stored element holding a value, with its standing, and each top-level
 * block holding a review member, which the closing pass reads. A root moves to
 * another version of itself through the reads the two do not share.
 */
export class ValueHolders {
  private generated: ReadonlyMap<string, unknown> | null = null;
  private readonly roots = new Map<string, RootReads>();
  private readonly reads: ElementReads;

  constructor(reads: ElementReads) {
    this.reads = reads;
  }

  /**
   * `root` as `index` holds it, read as `reading` says. It reads the root's
   * state, so it holds until the next call moves the root.
   */
  at(reading: HolderReading, root: string, index: DocumentIndex) {
    this.reads.use(reading);
    if (reading.generated !== this.generated) {
      this.generated = reading.generated;
      this.roots.clear();
    }

    const top = this.reads.top(false);
    let state = this.roots.get(root);

    if (!state) {
      state = { holders: new Map(), index, marked: new Map() };
      this.roots.set(root, state);
      for (let rank = 0; rank < index.size; rank += 1) {
        this.move(
          state,
          null,
          this.reads.of(getDefined(index.child(rank)), top)
        );
      }
    } else if (state.index !== index) {
      const old = state.index;

      for (const [fromA, toA, fromB, toB] of old.changedChildren(index)) {
        const paired = toA - fromA === toB - fromB;

        for (let rank = fromA; rank < toA; rank += 1) {
          this.move(
            state,
            this.reads.of(getDefined(old.child(rank)), top),
            paired
              ? this.reads.of(
                  getDefined(index.child(fromB + rank - fromA)),
                  top
                )
              : null
          );
        }
        if (paired) continue;
        for (let rank = fromB; rank < toB; rank += 1) {
          this.move(
            state,
            null,
            this.reads.of(getDefined(index.child(rank)), top)
          );
        }
      }
      state.index = index;
    }

    const { holders, marked } = state;

    return {
      holders: (at: HolderKey): readonly Holder[] => [
        ...(holders.get(at)?.keys() ?? NO_HOLDERS),
      ],
      marked: () => marked.keys(),
      unmarked: marked.size === 0,
    };
  }

  private move(
    state: RootReads,
    before: ElementRead | null,
    after: ElementRead | null
  ) {
    for (const [read, by] of [
      [before, -1],
      [after, 1],
    ] as const) {
      if (!read) continue;
      countCoreWork('heldBlocks');
      if (read.marked) count(state.marked, read.node, by);
    }

    const visit = (read: ElementRead, by: 1 | -1) => {
      if (read.above.spare) return;
      for (const [at, holder] of read.holders) {
        let holders = state.holders.get(at);

        if (!holders) {
          holders = new Map();
          state.holders.set(at, holders);
        }
        count(holders, holder, by);
        if (holders.size === 0) state.holders.delete(at);
      }
    };

    diffReads(before, after, {
      add: (read) => visit(read, 1),
      drop: (read) => visit(read, -1),
    });
  }
}

/** Whether a decision still to come can change what an owner as `standing` owns. */
export const isPendingOwner = (standing: Standing, pending: Pending) => {
  countCoreWork('rootOwnerChecks');

  return isPending(standing, pending);
};
