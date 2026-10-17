import { classifyRootChange } from '../../core/change/classification';
import {
  createInternalDocumentChange,
  DocumentChange,
  getInternalDocumentRootChange,
} from '../../core/change/document-change';
import {
  type DocumentIndex,
  rootNodesOf,
  type SparseNodes,
} from '../../core/change/document-index';
import { copyRoot, setLazyRoot } from '../../core/change/lazy-root';
import { RootChange } from '../../core/change/root-change';
import type { JsonEditorValue } from '../../core/change/tokens';
import type {
  CommandProjection,
  CommandProjectionMap,
  EditorFrameRecording,
} from '../../core/command-document';
import { createEditorCommit, getEditorCommitValue } from '../../core/commit';
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
import { EditorSchemaValidationError } from '../../core/schema-validation';
import { countCoreWork } from '../../core/work';
import type {
  AnyEditor as Editor,
  EditorCommit,
  EditorDocumentValue,
  EditorSnapshot,
} from '../../interfaces/editor';
import { getDefined } from '../../internal/get-defined';
import type { createDocumentMarksValidator } from '../facts/admission';
import { factsOf, primeInsertions } from '../facts/facts';
import { VERDICTS, verdictIncarnationsOf } from '../facts/records';
import {
  type AuthoredFormatProjection,
  type AuthoredLocationMap,
  locationMapOver,
} from '../format';
import { isAuthoredSetValued } from '../tree/marks';
import type { AuthoredResolveSchema } from '../tree/resolve';
import { ChangeBook } from './book';
import { RootProjection, type WrittenRoot } from './projection';
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
  roots: ReadonlyMap<string, RootState>
) => {
  const value = deriveValue(stored, {}) as Record<string, unknown>;
  const named: Record<string, unknown> = { ...stored.roots };
  let renamed = false;

  for (const [root, { index }] of roots) {
    if (index === rootOf(stored, root)) continue;
    if (root === 'main') {
      setLazyRoot(value, 'children', index);
    } else {
      named[root] = index.value;
      renamed = true;
    }
  }
  if (renamed) value.roots = Object.freeze(named);

  return Object.freeze(value) as JsonEditorValue;
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
  private syncing = false;
  private verdicts: RecordSetVersion | undefined;
  readonly mode: AuthoredFormatProjection;
  private readonly book: ChangeBook;

  constructor(mode: AuthoredFormatProjection, book: ChangeBook) {
    this.mode = mode;
    this.book = book;
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
    const written =
      write &&
      last &&
      write.preview === last.preview &&
      last.schema === schema &&
      verdicts === this.verdicts
        ? write
        : null;
    const writtenRoot = (root: string): WrittenRoot | null => {
      if (!written) return null;

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
      verdicts,
    });
    // A verdict changes what the runs naming its incarnation resolve to.
    const touched =
      this.verdicts === undefined || verdicts === this.verdicts
        ? new Map<string, readonly number[]>()
        : this.book
            .sync(value)
            .ranksNaming(
              verdictIncarnationsOf(recordSetChanges(this.verdicts, verdicts))
            );
    const changes = new Map<string, RootChange>();

    for (const root of this.roots.keys()) {
      if (!content.has(root)) this.roots.delete(root);
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

    // Back at the document before, the mode shows it as it did, so the
    // preview a reader holds stays.
    const prior = this.history?.prior;
    const back = prior && matches(prior, value, content, schema) ? prior : null;

    if (back) {
      for (const [root, projection] of this.roots) {
        projection.adopt(getDefined(back.roots.get(root)).index);
      }
    }

    const next: Synced = back ?? {
      preview: null,
      records,
      roots: new Map(
        [...this.roots].map(([root, projection]) => [
          root,
          { changed: projection.changed, index: projection.previewRoot },
        ])
      ),
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

  carried(root: string) {
    const change = this.history?.changes.get(root);
    const from = this.history?.prior?.roots.get(root);

    return change && from ? { change, from: from.index } : null;
  }

  value(stored: JsonEditorValue, schema: AuthoredResolveSchema | null) {
    return valueOf(this.sync(stored, schema));
  }

  step(
    before: JsonEditorValue,
    after: JsonEditorValue,
    schema: AuthoredResolveSchema | null
  ) {
    const content = contentRootsOf(before);
    const held = [this.history?.last, this.history?.prior].find(
      (synced) => synced && matches(synced, before, content, schema)
    );
    const to = this.sync(after, schema);
    // A document the mode no longer holds projects apart from it, so the
    // views reading the mode keep their previews.
    const from =
      held ?? new ModeProjection(this.mode, this.book).sync(before, schema);
    return {
      after: valueOf(to),
      before: valueOf(from),
      changes: this.changeOf(from, to),
    };
  }

  private changeOf(from: Synced, to: Synced) {
    const { changes, prior } = getDefined(this.history);

    if (from === to) return createInternalDocumentChange(new Map());
    if (prior === from && sameKeys(from.roots, to.roots)) {
      return createInternalDocumentChange(changes, {
        classifications: new Map(
          [...changes].map(([root, change]) => [
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
  (synced.preview ??= projectedValueOf(synced.value, synced.roots));

const sameKeys = (
  left: ReadonlyMap<string, unknown>,
  right: ReadonlyMap<string, unknown>
) =>
  left.size === right.size && [...left.keys()].every((key) => right.has(key));

const mapOf = (
  projection: ModeProjection,
  synced: Synced
): CommandProjectionMap => {
  const changed = [...synced.roots]
    .filter(([, root]) => root.changed)
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
        )
      );

      return composed;
    },
    hides: (root: string, position: number) =>
      live(root)?.hides(position) ?? false,
    roots: Object.freeze(changed),
    toProjected: (root: string, position: number, association) =>
      live(root)?.toProjected(position, association === 'forward' ? 1 : -1) ??
      position,
    toStored: (root: string, position: number, assoc: -1 | 1) =>
      live(root)?.toStored(position, assoc) ?? position,
  });
};

const snapshotOf = (
  owner: Editor,
  value: JsonEditorValue,
  version: number
): EditorSnapshot => {
  let index: EditorSnapshot['index'] | undefined;
  const snapshot = {
    selection: null,
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

/**
 * Everything review derives from one owner editor's stored document: the
 * projections commands and previews read, kept in step with the stored value
 * each reader asks about, so a key costs what its edit changed.
 *
 * @internal
 */
export class ReviewLedger {
  private readonly book = new ChangeBook();
  private checked: Roots = new Map();
  private readonly commits = new WeakMap<
    EditorCommit,
    Partial<Record<AuthoredFormatProjection, EditorCommit>>
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
      projection = new ModeProjection(mode, this.book);
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

  subscribe(stored: JsonEditorValue) {
    this.book.sync(stored);
    this.book.subscribe();
  }

  unsubscribe() {
    this.book.unsubscribe();
  }

  publish(stored: JsonEditorValue) {
    this.book.sync(stored);

    return this.book.publish();
  }

  ranksNaming(stored: JsonEditorValue, incarnations: readonly string[]) {
    return this.book.sync(stored).ranksNaming(incarnations);
  }

  /** Build what keys read, so the first key derives only its own edit. */
  prepare(value: JsonEditorValue) {
    this.check(value);
    primeInsertions(value);
    this.book.sync(value);
    try {
      this.frame(value);
    } catch (error) {
      // A document whose accepted form the schema refuses still loads; the
      // command or decision that reads that form reports the refusal.
      if (!(error instanceof EditorSchemaValidationError)) throw error;
    }
  }

  recorded({ change, frame, projection, stored }: EditorFrameRecording) {
    this.modeOf('proposed').sync(stored.value, this.schemaOf(), {
      change,
      preview: projection.value,
      value: frame.value,
    });
  }

  frame(stored: JsonEditorValue): CommandProjection | null {
    const projection = this.modeOf('proposed');
    const synced = projection.sync(stored, this.schemaOf());
    const value = valueOf(synced);

    if (this.lastFrame?.value === value) return this.lastFrame.frame;

    const changed = [...synced.roots].filter(([, root]) => root.changed);
    const carried = projection.carried('main');
    const frame: CommandProjection | null =
      changed.length === 0
        ? null
        : {
            ...(carried ? { carried } : {}),
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

  locationMap(
    stored: JsonEditorValue,
    mode: AuthoredFormatProjection,
    root: string
  ): AuthoredLocationMap {
    const projection = this.modeOf(mode);
    const synced = projection.sync(stored, this.schemaOf());
    const from = rootOf(stored, root);
    const state = synced.roots.get(root);

    return locationMapOver(
      from,
      state?.changed ? state.index : from,
      (position, assoc) =>
        projection.moveTo(synced).get(root)?.toProjected(position, assoc) ??
        position,
      root
    );
  }

  previewCommit(
    commit: EditorCommit,
    mode: AuthoredFormatProjection
  ): EditorCommit {
    const cached = this.commits.get(commit) ?? {};
    const known = cached[mode];

    if (known) return known;

    const { after, before, changes } = this.modeOf(mode).step(
      getEditorCommitValue(commit, 'before'),
      getEditorCommitValue(commit),
      this.schemaOf()
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
        after: snapshotOf(this.owner, after, commit.version),
        afterValue: after,
        annotations: commit.annotations,
        before: snapshotOf(this.owner, before, commit.previousVersion),
        beforeValue: before,
        changes,
        dirtyStateKeys: commit.dirtyStateKeys,
        editor: this.owner,
        effects: commit.effects,
        replace: commit.changed.hasAny('replace'),
        selectionAfter: null,
        selectionAfterRoot: 'main',
        selectionBefore: null,
        selectionBeforeRoot: 'main',
        selectionChanged: false,
        tags: commit.tags,
      },
      { previousVersion: commit.previousVersion, version: commit.version }
    );

    cached[mode] = projected;
    this.commits.set(commit, cached);

    return projected;
  }

  /**
   * Carry a preview's node keys through `commit` for each mode whose last
   * preview a reader indexed, so its keys stay while no view renders it.
   */
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
