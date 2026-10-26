import { classifyRootChange } from '../../core/change/classification';
import {
  createInternalDocumentChange,
  DocumentChange,
  getInternalDocumentRootChange,
} from '../../core/change/document-change';
import {
  DocumentIndex,
  rootNodesOf,
  type SparseNodes,
} from '../../core/change/document-index';
import { jsonEqual } from '../../core/change/json';
import { copyRoot, setLazyRoot } from '../../core/change/lazy-root';
import { RootChange } from '../../core/change/root-change';
import type { JsonEditorValue, JsonNode } from '../../core/change/tokens';
import type {
  CommandProjection,
  CommandProjectionMap,
  EditorFrameRecording,
} from '../../core/command-document';
import { createEditorCommit, getEditorCommitValue } from '../../core/commit';
import { getEditorSchema } from '../../core/editor-runtime';
import { ElementGenerationMaskedError } from '../../core/editor-schema';
import {
  ensureElementOwnedRootIndex,
  rebaseElementOwnedRootIndex,
} from '../../core/element-owned-root-index';
import { toInternalRoot } from '../../core/public-root';
import {
  getEditorProjectionSnapshotIndex,
  hasEditorProjectionSnapshotIndex,
  inheritEditorProjectionIndexes,
} from '../../core/public-state';
import {
  deriveValue,
  getRecordSetVersion,
  getValueRecords,
  type RecordSetVersion,
  recordSetChanges,
} from '../../core/record-store';
import {
  judgeProjectedRoots,
  type OwnershipSides,
  orphanedRoots,
  schemaHasContentRoots,
} from '../../core/root-ownership';
import type { CompiledEditorSchema } from '../../core/schema-compiler';
import { EditorSchemaValidationError } from '../../core/schema-validation';
import type { SelectionModeSchema } from '../../core/selection-protocol';
import { countCoreWork } from '../../core/work';
import type {
  AnyEditor as Editor,
  EditorCommit,
  EditorDocumentValue,
  EditorSnapshot,
} from '../../interfaces/editor';
import type { Selection } from '../../interfaces/selection';
import { getDefined } from '../../internal/get-defined';
import { getNodeKeyForNode } from '../../utils/node-keys';
import type { createDocumentMarksValidator } from '../facts/admission';
import { factsOf, primeInsertions } from '../facts/facts';
import {
  RESERVES,
  reserveRootOf,
  VERDICTS,
  verdictIncarnationsOf,
} from '../facts/records';
import type { AuthoredFormatProjection } from '../format';
import { tokenLength } from '../tree/alignment';
import { ElementReads, ValueHolders } from '../tree/holders';
import { isAuthoredSetValued } from '../tree/marks';
import { ShownBook } from '../tree/readiness';
import { type AuthoredResolveSchema, isTextBlock } from '../tree/resolve';
import { type BookSink, ChangeBook } from './book';
import type { WrittenList } from './level';
import { mapSpans, type Pairing, rankAt, type Span, startOf } from './pairs';
import {
  createPreviewLens,
  type PreviewLens,
  type RootedSelection,
} from './preview-lens';
import { RootProjection } from './projection';
import { contentRootsOf, type Roots, rootOf, sameRoots } from './roots';
import type { RunContext } from './runs';
import { countLedgerWork } from './work';

type MarksValidator = ReturnType<typeof createDocumentMarksValidator>;

type RootState = Readonly<{
  changed: boolean;
  index: DocumentIndex;
}>;

/**
 * One stored document a mode synced to, keyed by its records and root
 * indexes, since each read of a document builds a new value.
 */
type Synced = {
  readonly dropped: ReadonlySet<string>;
  readonly records: unknown;
  readonly roots: ReadonlyMap<string, RootState>;
  readonly schema: AuthoredResolveSchema | null;
  readonly stored: Roots;
  readonly value: JsonEditorValue;
  preview: JsonEditorValue | null;
};

type History = Readonly<{
  changes: ReadonlyMap<string, RootChange>;
  last: Synced;
  prior: Synced | null;
}>;

/**
 * What a mode shows of one stored document: each root as it shows it, null
 * where it drops the root, and the path at which a stored element shows
 * whole, null where it shows none in its place.
 */
export type PeekedView = Readonly<{
  index: (root: string) => DocumentIndex | null;
  path: (root: string, path: readonly number[]) => readonly number[] | null;
}>;

/**
 * What a frame's commands wrote, which the stored document its recording left
 * projects to.
 */
type FrameWrite = Readonly<{
  change: DocumentChange;
  preview: JsonEditorValue;
  value: JsonEditorValue;
}>;

const projectedValueOf = (
  stored: JsonEditorValue,
  roots: ReadonlyMap<string, RootState>,
  dropped: ReadonlySet<string>
) => {
  const value = deriveValue(stored, {}) as Record<string, unknown>;
  const named: Record<string, unknown> = { ...stored.roots };
  let renamed = dropped.size > 0;

  for (const [root, { index }] of roots) {
    if (dropped.has(root)) {
      delete named[root];
      continue;
    }
    if (index === rootOf(stored, root)) continue;
    if (root === 'main') {
      setLazyRoot(value, 'children', index);
    } else {
      named[root] = index.value;
      renamed = true;
    }
  }
  if (renamed) {
    if (Object.keys(named).length > 0) value.roots = Object.freeze(named);
    else delete value.roots;
  }

  return Object.freeze(value) as JsonEditorValue;
};

const NO_ROOTS: ReadonlySet<string> = new Set();

const droppedRoots = (
  ownership: CompiledEditorSchema | null,
  last: Synced | null,
  stored: Roots,
  previews: ReadonlyMap<string, DocumentIndex>,
  changes: ReadonlyMap<string, RootChange>
): ReadonlySet<string> => {
  if (!ownership || !schemaHasContentRoots(ownership)) return NO_ROOTS;

  const full = () =>
    new Set(
      orphanedRoots(ownership, {
        after: (root) => previews.get(root) ?? null,
        afterRoots: () => [...previews.keys()],
        before: (root) => stored.get(root) ?? null,
        beforeRoots: () => [...stored.keys()],
        changedRoots: new Map(
          [...previews]
            .filter(([root, index]) => stored.get(root) !== index)
            .map(([root]) => [root, undefined])
        ),
        tracked: NO_ROOTS,
      })
    );

  if (!last || last.schema?.ownership !== ownership) return full();

  const indexOf = (root: string, document: DocumentIndex | null) => {
    if (!document) return null;
    countCoreWork('ownerIndexReads');

    return ensureElementOwnedRootIndex(ownership, root, document);
  };
  const sidesOf = (
    before: ReadonlyMap<string, DocumentIndex>,
    after: ReadonlyMap<string, DocumentIndex>,
    afterOf: (
      root: string,
      from: DocumentIndex | null
    ) => OwnershipSides['after']
  ) => {
    const sides = new Map<string, OwnershipSides>();

    for (const root of new Set([...before.keys(), ...after.keys()])) {
      const from = before.get(root) ?? null;

      if (from === (after.get(root) ?? null)) continue;
      const beforeIndex = indexOf(root, from);

      sides.set(root, { after: afterOf(root, from), before: beforeIndex });
    }

    return sides;
  };
  const lastPreviews = new Map(
    [...last.roots].map(([root, { index }]) => [root, index])
  );

  return judgeProjectedRoots({
    closed: ownership.unknown === 'reject',
    created: new Set(
      [...stored.keys()].filter((root) => !last.stored.has(root))
    ),
    exists: (root) => stored.has(root),
    full,
    last: last.dropped,
    projected: sidesOf(lastPreviews, previews, (root, from) => {
      const to = previews.get(root) ?? null;
      const change = changes.get(root);

      if (!to || !from || !change) return indexOf(root, to);
      countCoreWork('ownerIndexReads');

      return rebaseElementOwnedRootIndex(ownership, root, change, from, to);
    }),
    projectedOf: (root) => indexOf(root, previews.get(root) ?? null),
    stored: sidesOf(last.stored, stored, (root) =>
      indexOf(root, stored.get(root) ?? null)
    ),
  });
};

/** One root of a mode about to move from `before` to `after`. */
type Moving = Readonly<{
  after: DocumentIndex;
  before: DocumentIndex;
  /** The projection still at `before`, or null where it shows it unchanged. */
  shown: RootProjection | null;
  touched: readonly number[];
  /** What the mode showed at `before`. */
  view: DocumentIndex;
}>;

/**
 * How a sync moved one root's view of a mode, from `from` to `to`, and
 * whether each is the stored root, whose node keys a view of it reads.
 */
type ViewMove = Readonly<{
  change: RootChange;
  from: DocumentIndex;
  fromStored: boolean;
  to: DocumentIndex;
  toStored: boolean;
}>;

/**
 * What a mode tells the ledger as it syncs: what a root showed before it
 * moved, then how its view moved, or null when it went back to an earlier
 * view no change describes.
 */
type Holder = Readonly<{
  hold: (mode: AuthoredFormatProjection, root: string, moving: Moving) => void;
  move: (
    mode: AuthoredFormatProjection,
    root: string,
    move: ViewMove | null
  ) => void;
}>;

/**
 * What a view of one mode showed before a sync moved it, around the content
 * the sync changed: for each view block touching it, where it opened, where
 * the first stored block it showed opened in `stored`, and the changes it
 * read.
 */
type HeldRun = Readonly<{
  blocks: ReadonlyArray<
    Readonly<{ at: number; ids: ReadonlySet<string>; shows: number | null }>
  >;
  stored: DocumentIndex;
}>;

/**
 * A publisher's runs since it last published, oldest first, with how its view
 * moved after each run that moved it.
 */
type Held = ReadonlyArray<HeldRun | ViewMove>;

/**
 * Each block `held`, a preview's earlier runs, kept, oldest first, with the
 * changes it read then and its rank in `view`, what the preview shows now.
 * A preview's block goes where a node holding its node key shows, as the
 * snapshot index gives a node it shows again its own key first, and else
 * where the preview's own change keeps its open token; a view of the stored
 * root reads the stored blocks' keys, so their identity does.
 *
 * @yields {{ ids: ReadonlySet<string>; rank: number }} The changes a kept
 * block read and its rank in `view`.
 */
function* heldBlocks(
  view: DocumentIndex,
  held: Held,
  identity: Pairing['identity']
) {
  const blocks: Array<{
    at: number | null;
    ids: ReadonlySet<string>;
    shows: number | null;
    stored: DocumentIndex;
  }> = [];

  const openingIn = (
    from: DocumentIndex,
    to: DocumentIndex,
    at: number | null
  ) => {
    if (at === null) return null;

    const [head, tail] = getDefined(
      mapSpans(from, to, [[at, at + 1]], identity)[0]
    );

    return head < tail ? head : null;
  };
  const keyedIn = (from: DocumentIndex, to: DocumentIndex, at: number) => {
    const head = openingIn(from, to, at);

    return head !== null &&
      identity(getDefined(from.nodes.at(rankAt(from, at)))) ===
        identity(getDefined(to.nodes.at(rankAt(to, head))))
      ? head
      : null;
  };

  for (const step of held) {
    if ('change' in step && step.toStored) {
      // A view of the stored root reads its node keys, so each block goes on
      // as the stored block it is or first showed.
      for (const block of blocks) {
        block.at = step.fromStored
          ? openingIn(step.from, step.to, block.at)
          : block.at === null
            ? null
            : openingIn(block.stored, step.to, block.shows);
      }
    } else if ('change' in step) {
      const { change, from, to } = step;
      // A moved block keeps its key where the move put it.
      const moved = change.movedNode(from);
      const source =
        moved?.path.length === 1
          ? startOf(from, getDefined(moved.path[0]))
          : null;

      for (const block of blocks) {
        if (block.at === null) continue;
        block.at =
          keyedIn(from, to, block.at) ??
          (block.at === source && moved
            ? moved.targetPath.length === 1
              ? startOf(to, getDefined(moved.targetPath[0]))
              : null
            : change.mapPos(block.at, 1, 'after'));
      }
    } else {
      for (const block of step.blocks) {
        blocks.push({ ...block, stored: step.stored });
      }
    }
  }
  for (const { at, ids } of blocks) {
    if (at === null) continue;
    countLedgerWork('previewSites');
    for (const entry of view.nodeRangesTouching(at, at + 1)) {
      if (entry.path.length === 1 && entry.from === at) {
        yield { ids, rank: getDefined(entry.path[0]) };
      }
    }
  }
}

/**
 * The ranges of `before` that `after` changed, descending into a node both
 * keep by `identity`, so a key inside one child of a long quote changes only
 * that child's range.
 */
const changedRanges = (
  before: DocumentIndex,
  after: DocumentIndex,
  identity: (node: JsonNode) => unknown
) => {
  const ranges: Array<readonly [number, number]> = [];
  const inside = (old: JsonNode, next: JsonNode, at: number) => {
    const left = old.children ?? [];
    const right = next.children ?? [];

    if (isTextBlock(old) || isTextBlock(next) || left.length === 0) {
      ranges.push([at, at + tokenLength(old)]);
      return;
    }

    let head = 0;
    let position = at + 1;
    let leftEnd = left.length;
    let rightEnd = right.length;

    // The element's own fields sit on its open token.
    ranges.push([at, at + 1]);
    while (head < leftEnd && head < rightEnd && left[head] === right[head]) {
      position += tokenLength(getDefined(left[head]));
      head += 1;
    }
    while (
      leftEnd > head &&
      rightEnd > head &&
      left[leftEnd - 1] === right[rightEnd - 1]
    ) {
      leftEnd -= 1;
      rightEnd -= 1;
    }
    countLedgerWork('narrowedChildren', head + left.length - leftEnd);

    if (leftEnd - head === 1 && rightEnd - head === 1) {
      const from = getDefined(left[head]);
      const to = getDefined(right[head]);

      if (identity(from) === identity(to)) {
        inside(from, to, position);
        return;
      }
    }

    let end = position;

    for (let index = head; index < leftEnd; index += 1) {
      end += tokenLength(getDefined(left[index]));
    }
    ranges.push([position, end]);
  };

  for (const [fromA, toA, fromB, toB] of before.changedChildren(after)) {
    const old = before.nodes.at(fromA);
    const next = after.nodes.at(fromB);
    const at = startOf(before, fromA);

    if (
      toA - fromA === 1 &&
      toB - fromB === 1 &&
      old &&
      next &&
      identity(old) === identity(next)
    ) {
      inside(old, next, at);
    } else {
      ranges.push([at, startOf(before, toA)]);
    }
  }

  return ranges;
};

const matches = (
  synced: Synced | null | undefined,
  value: JsonEditorValue,
  stored: Roots,
  schema: AuthoredResolveSchema | null
) =>
  !!synced &&
  synced.records === getValueRecords(value) &&
  synced.schema === schema &&
  sameRoots(synced.stored, stored);

class ModeProjection {
  private readonly roots = new Map<string, RootProjection>();
  private history: History | null = null;
  private readonly lenses = new WeakMap<Synced, PreviewLens>();
  private syncing = false;
  // A peek moves the mode and back without the views reading it noticing.
  private quiet = false;
  private verdicts: RecordSetVersion | undefined;
  private spares: RecordSetVersion | undefined;
  readonly mode: AuthoredFormatProjection;
  private readonly book: ChangeBook;
  private readonly schema: () => SelectionModeSchema;
  private readonly holder: Holder | null;

  constructor(
    mode: AuthoredFormatProjection,
    book: ChangeBook,
    schema: () => SelectionModeSchema,
    holder: Holder | null = null
  ) {
    this.mode = mode;
    this.book = book;
    this.schema = schema;
    this.holder = holder;
  }

  /**
   * Given `write`, what a frame's commands wrote before its recording left
   * `value`, the mode may take that write as its projection while it still
   * shows what the commands decided on.
   */
  sync(
    value: JsonEditorValue,
    schema: AuthoredResolveSchema | null,
    write: FrameWrite | null = null
  ): Synced {
    const content = contentRootsOf(value);
    const last = this.history?.last ?? null;

    if (last && matches(last, value, content, schema)) return last;

    const facts = factsOf(value);
    const records = getValueRecords(value);
    const verdicts = getRecordSetVersion(records, VERDICTS);
    const spares = getRecordSetVersion(records, RESERVES);
    const respared = new Set(
      this.spares === undefined
        ? []
        : recordSetChanges(this.spares, spares).map(reserveRootOf)
    );
    const written =
      write &&
      last &&
      write.preview === last.preview &&
      last.schema === schema &&
      verdicts === this.verdicts
        ? write
        : null;
    const writtenRoot = (root: string): WrittenList | null => {
      if (!written || respared.has(root)) return null;
      const droppedByFrame =
        root !== 'main' && !Object.hasOwn(written.value.roots ?? {}, root);

      if (droppedByFrame) return null;

      const index = rootOf(written.value, root);

      return {
        change:
          getInternalDocumentRootChange(written.change, root) ??
          RootChange.empty(index.length),
        index,
      };
    };
    const contextOf = (root: string): RunContext => ({
      facts,
      isSetValued: isAuthoredSetValued,
      mode: this.mode,
      root,
      schema,
      spares,
      verdicts,
    });
    // A verdict changes what the runs naming its incarnation resolve to.
    const touched = new Map(
      this.verdicts === undefined || verdicts === this.verdicts
        ? []
        : this.book
            .sync(value)
            .ranksNaming(
              verdictIncarnationsOf(recordSetChanges(this.verdicts, verdicts))
            )
    );
    const changes = new Map<string, RootChange>();

    for (const root of this.roots.keys()) {
      if (!content.has(root)) this.roots.delete(root);
    }
    for (const root of respared) {
      const projection = this.roots.get(root);
      const index = content.get(root);
      const readers =
        projection &&
        index &&
        projection.unpendedSpareReaders(index, contextOf(root));

      if (readers && readers.length > 0) {
        touched.set(root, [...(touched.get(root) ?? []), ...readers]);
      }
    }
    if (last && this.holder && !this.quiet) {
      for (const [root, index] of content) {
        const projection = this.roots.get(root);
        const before = last.stored.get(root);
        const shown = last.roots.get(root);

        if (projection && before && shown) {
          this.holder.hold(this.mode, root, {
            after: index,
            before,
            shown: shown.changed ? projection : null,
            touched: touched.get(root) ?? [],
            view: shown.index,
          });
        }
      }
    }
    this.syncing = true;
    try {
      for (const [root, index] of content) {
        const projection = this.roots.get(root);

        try {
          if (projection) {
            const change = projection.sync(
              index,
              contextOf(root),
              touched.get(root),
              writtenRoot(root)
            );

            if (change) changes.set(root, change);
          } else {
            this.roots.set(
              root,
              new RootProjection(this.mode, index, contextOf(root))
            );
          }
        } catch (error) {
          // A sync the kernel refused part way leaves the root half moved, so
          // the next one derives it again.
          this.roots.delete(root);
          this.history = null;
          throw error;
        }
      }
    } finally {
      this.syncing = false;
    }
    this.verdicts = verdicts;
    this.spares = spares;

    // Back at the document before, the mode shows it as it did, so the
    // preview a reader holds stays.
    const prior = this.history?.prior;
    const back = prior && matches(prior, value, content, schema) ? prior : null;

    if (back) {
      for (const [root, projection] of this.roots) {
        projection.adopt(getDefined(back.roots.get(root)).index);
        if (!this.quiet) this.holder?.move(this.mode, root, null);
      }
    } else if (this.holder && !this.quiet) {
      for (const [root, change] of changes) {
        const from = last?.roots.get(root)?.index;
        const to = getDefined(this.roots.get(root)).previewRoot;

        if (from) {
          this.holder.move(this.mode, root, {
            change,
            from,
            fromStored: from === last?.stored.get(root),
            to,
            toStored: to === content.get(root),
          });
        }
      }
    }

    const roots = new Map(
      [...this.roots].map(([root, projection]) => [
        root,
        { changed: projection.changed, index: projection.previewRoot },
      ])
    );
    const next: Synced = back ?? {
      dropped: droppedRoots(
        schema?.ownership ?? null,
        last,
        content,
        new Map([...roots].map(([root, { index }]) => [root, index])),
        changes
      ),
      preview: null,
      records,
      roots,
      schema,
      stored: content,
      value,
    };

    this.history = { changes, last: next, prior: last };

    return next;
  }

  moveTo(synced: Synced) {
    if (this.syncing) {
      throw new Error('A review projection was read while its mode synced.');
    }
    if (
      !matches(this.history?.last, synced.value, synced.stored, synced.schema)
    ) {
      this.sync(synced.value, synced.schema);
    }

    return this.roots;
  }

  /**
   * Calls `read` with what the mode shows of each of `values`, synced in
   * turn, then returns the mode to the document it held, its last state and
   * the previews built from it untouched. A root a sync refused part way is
   * derived again.
   */
  peek(
    values: readonly JsonEditorValue[],
    schema: AuthoredResolveSchema | null,
    read: (view: PeekedView, at: number) => void
  ) {
    const { history, spares, verdicts } = this;
    const known = new Map(this.roots);
    const syncTo = (
      value: JsonEditorValue,
      to: AuthoredResolveSchema | null
    ) => {
      const content = contentRootsOf(value);

      // A root a sync left out is as that sync found it, so a later one moves
      // it from there.
      for (const [root, projection] of known) {
        if (content.has(root) && !this.roots.has(root)) {
          this.roots.set(root, projection);
        }
      }
      try {
        return this.sync(value, to);
      } catch (error) {
        for (const root of content.keys()) {
          if (!this.roots.has(root)) known.delete(root);
        }
        throw error;
      } finally {
        for (const [root, projection] of this.roots) {
          known.set(root, projection);
        }
      }
    };

    this.quiet = true;
    try {
      values.forEach((value, at) => {
        const synced = syncTo(value, schema);

        read(
          {
            index: (root) =>
              synced.dropped.has(root)
                ? null
                : (synced.roots.get(root)?.index ?? null),
            path: (root, path) => {
              if (synced.dropped.has(root)) return null;

              const state = synced.roots.get(root);

              if (!state?.changed) return state ? path : null;

              const shown = getDefined(this.roots.get(root));
              const { from } = rootOf(synced.value, root).nodeRange(path);
              const place = shown.toProjected(from, 1);

              if (shown.toProjected(from + 1, -1) !== place + 1) return null;

              const entry = state.index.nodeStartingAt(place);

              return entry?.from === place && entry.kind === 'element'
                ? entry.path
                : null;
            },
          },
          at
        );
      });
    } finally {
      try {
        if (history) {
          syncTo(history.last.value, history.last.schema);
          for (const [root, projection] of this.roots) {
            projection.adopt(getDefined(history.last.roots.get(root)).index);
          }
          this.history = history;
        } else {
          // A mode with no history holds no document to go back to, so its
          // next sync derives its roots afresh.
          this.roots.clear();
          this.history = null;
        }
        this.verdicts = verdicts;
        this.spares = spares;
      } finally {
        this.quiet = false;
      }
    }
  }

  carried(root: string) {
    const change = this.history?.changes.get(root);
    const from = this.history?.prior?.roots.get(root);

    return change && from ? { change, from: from.index } : null;
  }

  value(stored: JsonEditorValue, schema: AuthoredResolveSchema | null) {
    return valueOf(this.sync(stored, schema));
  }

  lens(stored: JsonEditorValue, schema: AuthoredResolveSchema | null) {
    this.sync(stored, schema);

    return this.lastLens();
  }

  // `mapOf` moves the mode to the state it maps, so only the last state gets
  // a lens.
  private lastLens(): PreviewLens {
    const synced = getDefined(this.history).last;
    const known = this.lenses.get(synced);

    if (known) return known;

    const lens = createPreviewLens({
      map: mapOf(this, synced),
      schema: this.schema(),
      shownIndex: (root) => {
        const state = synced.roots.get(root);

        return state?.changed ? state.index : rootOf(synced.value, root);
      },
      storedIndex: (root) => rootOf(synced.value, root),
    });

    this.lenses.set(synced, lens);

    return lens;
  }

  step(
    before: JsonEditorValue,
    after: JsonEditorValue,
    schema: AuthoredResolveSchema | null,
    selections: Readonly<{ after: RootedSelection; before: RootedSelection }>,
    leans = false
  ) {
    const content = contentRootsOf(before);
    const held = [this.history?.last, this.history?.prior].find(
      (synced) => synced && matches(synced, before, content, schema)
    );
    // A document the mode no longer holds projects apart from it, so the
    // views reading the mode keep their previews.
    let apart: ModeProjection | undefined;
    const apartFrom = () => {
      apart ??= new ModeProjection(this.mode, this.book, this.schema);

      return apart;
    };
    // Syncing to `after` leaves `before`, so its selection comes first from
    // where a view last read it, even leaning otherwise than `leans`, or maps.
    const shownBefore = (): Selection => {
      const { root, selection } = selections.before;

      if (!selection) return null;

      const current = !!held && held === this.history?.last;
      const lens = current ? this.lastLens() : held && this.lenses.get(held);
      const read = lens?.lastView(selection, root);

      if (read !== undefined) return read;
      if (current) return this.lastLens().toView(selection, root, leans);
      if (held) countLedgerWork('apartSelections');

      return apartFrom().lens(before, schema).toView(selection, root, leans);
    };
    const selectionBefore = shownBefore();
    const to = this.sync(after, schema);
    const from = held ?? apartFrom().sync(before, schema);

    return {
      after: valueOf(to),
      before: valueOf(from),
      changes: this.changeOf(from, to),
      selectionAfter: this.lastLens().toView(
        selections.after.selection,
        selections.after.root,
        leans
      ),
      selectionBefore,
    };
  }

  private changeOf(from: Synced, to: Synced) {
    const { changes, prior } = getDefined(this.history);

    if (from === to) return createInternalDocumentChange(new Map());
    if (
      prior === from &&
      sameKeys(from.roots, to.roots) &&
      sameKeys(from.dropped, to.dropped)
    ) {
      const shown =
        to.dropped.size === 0
          ? changes
          : new Map([...changes].filter(([root]) => !to.dropped.has(root)));

      return createInternalDocumentChange(shown, {
        classifications: new Map(
          [...shown].map(([root, change]) => [
            root,
            classifyRootChange(
              change,
              getDefined(from.roots.get(root)).index,
              getDefined(to.roots.get(root)).index
            ),
          ])
        ),
      });
    }
    countLedgerWork('diffedCommits');

    return DocumentChange.between(valueOf(from), valueOf(to), {
      isSetValued: isAuthoredSetValued,
    });
  }

  builtValues() {
    return [this.history?.prior?.preview, this.history?.last.preview].filter(
      (value): value is JsonEditorValue => !!value
    );
  }
}

const valueOf = (synced: Synced) =>
  (synced.preview ??= projectedValueOf(
    synced.value,
    synced.roots,
    synced.dropped
  ));

const sameKeys = (
  left: ReadonlyMap<string, unknown> | ReadonlySet<string>,
  right: ReadonlyMap<string, unknown> | ReadonlySet<string>
) =>
  left.size === right.size && [...left.keys()].every((key) => right.has(key));

const mapOf = (
  projection: ModeProjection,
  synced: Synced
): CommandProjectionMap => {
  const changed = [...synced.roots]
    .filter(([root, state]) => state.changed && !synced.dropped.has(root))
    .map(([root]) => root);
  const live = (root: string) =>
    changed.includes(root) ? projection.moveTo(synced).get(root) : undefined;
  let composed: ReturnType<typeof createInternalDocumentChange> | null = null;

  return Object.freeze({
    added: (root: string, position: number) =>
      live(root)?.added(position) ?? null,
    breaks: (root: string, from: number, to: number) =>
      live(root)?.breaks(from, to) ?? [],
    change: () => {
      countCoreWork('projectionChanges');
      composed ??= createInternalDocumentChange(
        new Map(
          changed.map((root) => [root, getDefined(live(root)).composedChange()])
        ),
        { deleteRoots: synced.dropped }
      );

      return composed;
    },
    hides: (root: string, position: number) =>
      synced.dropped.has(root) || (live(root)?.hides(position) ?? false),
    moved: (root: string) => live(root)?.moved() ?? [],
    // A node shows whole as one node when its open token keeps its place and
    // a projected node starts there.
    nodePath: (root: string, path: readonly number[]) => {
      if (synced.dropped.has(root)) return null;

      const shown = live(root);

      if (!shown) return [...path];

      const { from } = rootOf(synced.value, root).nodeRange(path);
      const at = shown.toProjected(from, 1);

      if (shown.toProjected(from + 1, -1) !== at + 1) return null;

      const entry = getDefined(synced.roots.get(root)).index.nodeStartingAt(at);

      return entry?.from === at ? [...entry.path] : null;
    },
    projectRange: (root: string, low: number, high: number) =>
      synced.dropped.has(root)
        ? null
        : (live(root)?.projectRange(low, high) ?? {
            from: low,
            kind: 'placed',
            to: high,
          }),
    reorders: (root: string) => live(root)?.reorders ?? false,
    roots: Object.freeze(changed),
    toProjected: (root: string, position: number, association) =>
      synced.dropped.has(root)
        ? null
        : (live(root)?.toProjected(
            position,
            association === 'forward' ? 1 : -1
          ) ?? position),
    toStored: (root: string, position: number, assoc: -1 | 1) =>
      synced.dropped.has(root)
        ? null
        : (live(root)?.toStored(position, assoc) ?? position),
  });
};

const snapshotOf = (
  owner: Editor,
  value: JsonEditorValue,
  version: number,
  selection: Selection
): EditorSnapshot => {
  let index: EditorSnapshot['index'] | undefined;
  const snapshot = {
    selection,
    version,
    get index() {
      return (index ??= getEditorProjectionSnapshotIndex(
        owner,
        (value as EditorDocumentValue).children
      ));
    },
  };

  copyRoot(
    snapshot as Record<string, unknown>,
    'children',
    value as Readonly<{ children: readonly unknown[] }>,
    'children'
  );

  return Object.freeze(snapshot) as unknown as EditorSnapshot;
};

// A view block holds a site its stored spans overlap, and a collapsed site,
// where a block left, inside one of its spans or where two of them meet.
const holdsSite = (
  spans: ReadonlyArray<readonly [number, number]>,
  from: number,
  to: number
) =>
  from < to
    ? spans.some(([head, tail]) => head < to && from < tail)
    : spans.some(([head, tail]) => head < from && from < tail) ||
      (spans.some(([, tail]) => tail === from) &&
        spans.some(([head]) => head === from));

/**
 * What a view of a mode reads at its own places of a root: the root it
 * shows, the stored ranges each of its ranges shows and whether it takes
 * away a stored token.
 *
 * @internal
 */
export type ViewPlaces = Readonly<{
  dissolves: (position: number) => boolean;
  index: DocumentIndex;
  readers: (from: number, to: number) => readonly [number, number];
  spans: (from: number, to: number) => ReadonlyArray<readonly [number, number]>;
}>;

// A preview that drops a root shows no block of it, so its places read
// nothing rather than the stored root.
const DROPPED_PLACES: ViewPlaces = Object.freeze({
  dissolves: () => false,
  index: DocumentIndex.fromValue([]),
  readers: (from: number, to: number) => [from, to] as const,
  spans: () => [],
});

/**
 * Everything review derives from one owner editor's stored document: the
 * projections commands and previews read, kept in step with the stored value
 * each reader asks about, so a key costs what its edit changed.
 *
 * @internal
 */
export class ReviewLedger {
  private readonly reads = new ElementReads();
  readonly holders = new ValueHolders(this.reads);
  /** What decides which shown values are ready to settle. */
  readonly shown = new ShownBook(this.reads);
  private readonly book = new ChangeBook((node) => this.identity(node));
  private readonly identity = (node: JsonNode): unknown =>
    getNodeKeyForNode(node, this.owner) ?? node;
  // By publisher and root, what its preview showed around each change since
  // it last published, so that run still names the view blocks that showed a
  // change.
  private readonly held = new WeakMap<BookSink, Map<string, Held>>();
  private checked: Roots = new Map();
  private readonly commits = new WeakMap<
    EditorCommit,
    Partial<Record<`${AuthoredFormatProjection}${'' | ':leans'}`, EditorCommit>>
  >();
  private readonly modes = new Map<AuthoredFormatProjection, ModeProjection>();
  private lastFrame: Readonly<{
    frame: CommandProjection | null;
    value: JsonEditorValue;
  }> | null = null;

  private readonly owner: Editor;
  private readonly schemaOf: () => AuthoredResolveSchema | null;
  private readonly marks: MarksValidator;

  constructor(
    owner: Editor,
    schemaOf: () => AuthoredResolveSchema | null,
    marks: MarksValidator
  ) {
    this.owner = owner;
    this.schemaOf = schemaOf;
    this.marks = marks;
  }

  private modeOf(mode: AuthoredFormatProjection) {
    let projection = this.modes.get(mode);

    if (!projection) {
      projection = new ModeProjection(
        mode,
        this.book,
        () => getEditorSchema(this.owner),
        this.holder
      );
      this.modes.set(mode, projection);
    }

    return projection;
  }

  check(value: JsonEditorValue) {
    const roots = contentRootsOf(value);
    const changed: Array<SparseNodes<unknown>> = [];

    for (const [root, index] of roots) {
      const last = this.checked.get(root);

      if (last !== index) {
        changed.push(last ? changedBlocks(last, index) : index.nodes);
      }
    }
    if (changed.length > 0) {
      this.marks.validateIn(value as EditorDocumentValue, changed);
    }
    this.checked = roots;
  }

  changes(stored: JsonEditorValue) {
    return this.book.sync(stored);
  }

  subscribe(stored: JsonEditorValue, mode: AuthoredFormatProjection | null) {
    this.book.sync(stored);
    // The publisher's runs start from what its preview shows now.
    if (mode) this.modeOf(mode).sync(stored, this.schemaOf());

    const sink = this.book.subscribe(mode);

    this.held.set(sink, new Map());

    return sink;
  }

  unsubscribe(sink: BookSink) {
    this.book.unsubscribe(sink);
  }

  /**
   * Keep, for each publisher under a mode, what its view showed around each
   * sync's changes and how the sync moved it.
   */
  private readonly holder: Holder = {
    hold: (mode, root, moving) => {
      const sinks = [...this.book.sinksUnder(mode)];

      if (sinks.length === 0) return;

      const { after, before, shown, touched, view } = moving;
      const blocksAt = (index: DocumentIndex) =>
        touched.map(
          (rank) => [startOf(index, rank), startOf(index, rank + 1)] as const
        );
      const ranges =
        before === after
          ? blocksAt(before)
          : [
              ...changedRanges(before, after, this.identity),
              ...mapSpans(after, before, blocksAt(after), this.identity),
            ];

      if (ranges.length === 0) return;

      const blocks = new Map<number, HeldRun['blocks'][number]>();

      for (const [from, to] of ranges) {
        const [low, high] = shown ? shown.readers(from, to) : [from, to];

        for (const entry of view.nodeRangesTouching(
          Math.min(low, high),
          Math.max(low, high)
        )) {
          const rank = getDefined(entry.path[0]);

          if (entry.path.length !== 1 || blocks.has(rank)) continue;
          const spans = shown
            ? shown.spans(entry.from, entry.to)
            : [[entry.from, entry.to] as const];
          const first = spans[0];

          blocks.set(rank, {
            at: entry.from,
            ids: this.book.idsShownIn(
              before,
              spans,
              (position) => shown?.dissolves(position) ?? false
            ),
            shows: first ? startOf(before, rankAt(before, first[0])) : null,
          });
        }
      }

      const run: HeldRun = { blocks: [...blocks.values()], stored: before };

      for (const sink of sinks) {
        const held = getDefined(this.held.get(sink));

        held.set(root, [...(held.get(root) ?? []), run]);
      }
    },
    move: (mode, root, move) => {
      for (const sink of this.book.sinksUnder(mode)) {
        const held = getDefined(this.held.get(sink));
        const runs = held.get(root);

        if (!runs) continue;
        if (move) held.set(root, [...runs, move]);
        else held.delete(root);
      }
    },
  };

  /**
   * What the syncs since `sink` last published changed: the shared delta,
   * and the ranks of the top-level blocks of a view of `mode`, or of the
   * stored document with none, whose read holds a stored site `sink`
   * gathered. Under the preview it last published, each block that showed
   * other changes in that run than it shows now is named too, since a block
   * a commit rewrites keeping its pairs can move them to another.
   */
  publish(
    stored: JsonEditorValue,
    sink: BookSink,
    mode: AuthoredFormatProjection | null,
    root: string
  ) {
    const book = this.book.sync(stored);
    const last = sink.mode;
    const places = mode ? this.viewPlaces(stored, mode, root) : null;
    const { delta, sites } = this.book.publish(sink, mode);
    const held = getDefined(this.held.get(sink));
    const runs = last === mode ? (held.get(root) ?? []) : [];
    const ranks = this.ranksShowing(stored, sites.get(root) ?? [], mode, root);

    held.clear();
    if (places && runs.length > 0) {
      // The pending changes a block reads, counting those decided since.
      const removed = new Set(delta.removed);
      const idsOf = (ids: Iterable<string>) =>
        [...ids]
          .filter((id) => book.has(id) || removed.has(id))
          .sort()
          .join(',');
      const compared = new Set<number>();

      for (const { ids, rank } of heldBlocks(
        places.index,
        runs,
        this.identity
      )) {
        if (compared.has(rank)) continue;
        compared.add(rank);

        const shows = book.idsShown(
          root,
          places.spans(
            startOf(places.index, rank),
            startOf(places.index, rank + 1)
          ),
          places.dissolves
        );

        if (idsOf(ids) !== idsOf(shows)) ranks.add(rank);
      }
    }

    return {
      delta,
      ranks: [...ranks].sort((left, right) => left - right),
    };
  }

  private ranksShowing(
    stored: JsonEditorValue,
    sites: readonly Span[],
    mode: AuthoredFormatProjection | null,
    root: string
  ) {
    const ranks = new Set<number>();

    if (sites.length === 0) return ranks;

    const places = mode ? this.viewPlaces(stored, mode, root) : null;
    const index = places?.index ?? rootOf(stored, root);

    for (const [from, to, only] of sites) {
      if (only && only !== mode) continue;

      const [low, high] = places ? places.readers(from, to) : [from, to];

      if (places) countLedgerWork('previewSites');
      for (const entry of index.nodeRangesTouching(
        Math.min(low, high),
        Math.max(low, high)
      )) {
        const rank = getDefined(entry.path[0]);

        if (entry.path.length !== 1 || ranks.has(rank)) continue;

        const spans = places
          ? places.spans(entry.from, entry.to)
          : [[entry.from, entry.to] as const];
        if (holdsSite(spans, from, to)) ranks.add(rank);
      }
    }

    return ranks;
  }

  ranksNaming(stored: JsonEditorValue, incarnations: readonly string[]) {
    return this.book.sync(stored).ranksNaming(incarnations);
  }

  /** Build what keys read, so the first key derives only its own edit. */
  prepare(value: JsonEditorValue): Readonly<{ framed: boolean }> {
    this.check(value);
    primeInsertions(value);
    this.book.sync(value);
    try {
      this.frame(value);
      return { framed: true };
    } catch (error) {
      // A document whose accepted form the schema refuses, or needs a spare
      // it lacks, still loads; the command or decision that reads that form
      // reports the refusal.
      if (
        !(error instanceof EditorSchemaValidationError) &&
        !(error instanceof ElementGenerationMaskedError)
      ) {
        throw error;
      }
      return { framed: false };
    }
  }

  recorded({ change, frame, projection, stored }: EditorFrameRecording) {
    this.modeOf('proposed').sync(stored.value, this.schemaOf(), {
      change,
      preview: projection.value,
      value: frame.value,
    });
  }

  /** What the proposed view shows of each of `values`, as the mode's peek. */
  peek(
    values: readonly JsonEditorValue[],
    read: (view: PeekedView, at: number) => void
  ) {
    this.modeOf('proposed').peek(values, this.schemaOf(), read);
  }

  dropped(stored: JsonEditorValue) {
    return this.modeOf('proposed').sync(stored, this.schemaOf()).dropped;
  }

  frame(stored: JsonEditorValue): CommandProjection | null {
    const projection = this.modeOf('proposed');
    const synced = projection.sync(stored, this.schemaOf());
    const value = valueOf(synced);

    if (this.lastFrame?.value === value) return this.lastFrame.frame;

    const changed = [...synced.roots].filter(
      ([root, state]) => state.changed && !synced.dropped.has(root)
    );
    const carried = new Map(
      changed.flatMap(([root]) => {
        const previous = projection.carried(root);
        return previous ? [[root, previous] as const] : [];
      })
    );
    const frame: CommandProjection | null =
      changed.length === 0 && synced.dropped.size === 0
        ? null
        : {
            carried,
            indexes: new Map(changed.map(([root, { index }]) => [root, index])),
            map: mapOf(projection, synced),
            value: value as EditorDocumentValue,
          };

    this.lastFrame = { frame, value };

    return frame;
  }

  /** `stored` as `mode` shows it, one object while the stored document stays. */
  preview(stored: JsonEditorValue, mode: AuthoredFormatProjection) {
    return this.modeOf(mode).value(stored, this.schemaOf());
  }

  projectionMap(stored: JsonEditorValue, mode: AuthoredFormatProjection) {
    const projection = this.modeOf(mode);

    return mapOf(projection, projection.sync(stored, this.schemaOf()));
  }

  /**
   * The stored and projected spans of each run `mode` shows in another
   * order than the stored one. Only the recording laws read it, to tell
   * its places apart.
   *
   * @internal
   */
  orderedSpans(
    stored: JsonEditorValue,
    mode: AuthoredFormatProjection,
    root: string
  ) {
    const projection = this.modeOf(mode);
    const synced = projection.sync(stored, this.schemaOf());

    return synced.roots.get(root)?.changed
      ? (projection.moveTo(synced).get(root)?.orderedSpans() ?? [])
      : [];
  }

  viewPlaces(
    stored: JsonEditorValue,
    mode: AuthoredFormatProjection,
    root: string
  ): ViewPlaces {
    const projection = this.modeOf(mode);
    const synced = projection.sync(stored, this.schemaOf());

    if (synced.dropped.has(root)) return DROPPED_PLACES;

    const state = synced.roots.get(root);
    const shown = state?.changed
      ? projection.moveTo(synced).get(root)
      : undefined;

    return {
      dissolves: (position: number) => shown?.dissolves(position) ?? false,
      index: state?.index ?? rootOf(stored, root),
      readers: (from: number, to: number) =>
        shown?.readers(from, to) ?? [from, to],
      spans: (from: number, to: number) =>
        shown ? shown.spans(from, to) : [[from, to] as const],
    };
  }

  lens(stored: JsonEditorValue, mode: AuthoredFormatProjection) {
    return this.modeOf(mode).lens(stored, this.schemaOf());
  }

  previewCommit(
    commit: EditorCommit,
    mode: AuthoredFormatProjection,
    leans = false
  ): EditorCommit {
    const cached = this.commits.get(commit) ?? {};
    const key = leans ? (`${mode}:leans` as const) : mode;
    const known = cached[key];

    if (known) return known;

    const afterRoot = toInternalRoot(commit.selectionAfterRoot);
    const beforeRoot = toInternalRoot(commit.selectionBeforeRoot);
    const { after, before, changes, selectionAfter, selectionBefore } =
      this.modeOf(mode).step(
        getEditorCommitValue(commit, 'before'),
        getEditorCommitValue(commit),
        this.schemaOf(),
        {
          after: { root: afterRoot, selection: commit.selectionAfter },
          before: { root: beforeRoot, selection: commit.selectionBefore },
        },
        leans
      );

    if (!changes.empty) {
      inheritEditorProjectionIndexes(
        this.owner,
        before as EditorDocumentValue,
        after as EditorDocumentValue,
        changes
      );
    }

    const projected = createEditorCommit(
      {
        after: snapshotOf(
          this.owner,
          after,
          commit.version,
          afterRoot === 'main' ? selectionAfter : null
        ),
        afterValue: after,
        annotations: commit.annotations,
        before: snapshotOf(
          this.owner,
          before,
          commit.previousVersion,
          beforeRoot === 'main' ? selectionBefore : null
        ),
        beforeValue: before,
        changes,
        dirtyStateKeys: commit.dirtyStateKeys,
        editor: this.owner,
        effects: commit.effects,
        replace: commit.changed.hasAny('replace'),
        selectionAfter,
        selectionAfterRoot: afterRoot,
        selectionBefore,
        selectionBeforeRoot: beforeRoot,
        selectionChanged:
          (selectionBefore !== null || selectionAfter !== null) &&
          (beforeRoot !== afterRoot ||
            !jsonEqual(selectionBefore, selectionAfter)),
        tags: commit.tags,
      },
      { previousVersion: commit.previousVersion, version: commit.version }
    );

    cached[key] = projected;
    this.commits.set(commit, cached);

    return projected;
  }

  carry(commit: EditorCommit) {
    for (const [mode, projection] of this.modes) {
      const indexed = projection
        .builtValues()
        .some((value) =>
          hasEditorProjectionSnapshotIndex(
            this.owner,
            rootNodesOf(value, 'children')
          )
        );

      if (indexed) this.previewCommit(commit, mode);
    }
  }
}

const changedBlocks = (
  before: DocumentIndex,
  after: DocumentIndex
): SparseNodes<unknown> => {
  const ranges = before.changedChildren(after);

  return {
    forEach: (visit) => {
      for (const range of ranges) {
        for (let index = range[2]; index < range[3]; index += 1) {
          visit(getDefined(after.child(index)), index);
        }
      }
    },
  };
};

const LEDGERS = new WeakMap<object, ReviewLedger>();

/** @internal */
export const createReviewLedger = (
  owner: Editor,
  schemaOf: () => AuthoredResolveSchema | null,
  marks: MarksValidator
) => {
  const ledger = new ReviewLedger(owner, schemaOf, marks);

  LEDGERS.set(owner, ledger);

  return ledger;
};

/** @internal */
export const getReviewLedger = (owner: Editor) => LEDGERS.get(owner) ?? null;
