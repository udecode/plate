import { getDefined } from '../../internal/get-defined';
import type { CompositionStamp } from '../composition-stamp';
import { countCoreWork } from '../work';
import {
  classifyRootChange,
  classifyRootChangeWithRuntimeCandidates,
  type DocumentChangeRootClassification,
  type DocumentChangeRuntimeCandidate,
} from './classification';
import {
  applyDocumentChangeWithIndexes,
  createInternalDocumentChange,
  DocumentChange,
  freezeReadonlyMap,
  getInternalDocumentChangeClassification,
  getInternalDocumentChangeClassificationEntries,
  getInternalDocumentChangeEntries,
  getInternalDocumentChangeRecords,
  getInternalDocumentChangeRootKeys,
  getInternalDocumentRootChange,
  valueRootIndex,
} from './document-change';
import { DocumentIndex, rootNodesOf } from './document-index';
import type { JsonRecord } from './json';
import type { CarriedDrop, Relocation } from './lineage';
import {
  landMarks,
  type LetterSpan,
  mergeSpans,
  type NewLetters,
  textSpansIn,
} from './new-letters';
import {
  RootChange,
  type DocumentSetPropertyResolver,
  insertNodeChange,
  insertTextChange,
  mergeNodeChange,
  moveNodeChange,
  reconcileChildrenStep,
  removeNodeChange,
  removeTextChange,
  replaceChildrenChange,
  type ChildRun,
  replaceChildRunsChange,
  setNodeChange,
  setNodesChange,
  splitNodeChange,
} from './root-change';
import {
  type PreparedTokenSlice,
  isTextNode,
  type JsonEditorValue,
  type JsonNode,
  type JsonPoint,
} from './tokens';

export type DocumentChangeStep = Readonly<{
  after: JsonEditorValue;
  before: JsonEditorValue;
  change: DocumentChange;
  indexedAfter: ReadonlyMap<string, DocumentIndex>;
  indexedBefore: ReadonlyMap<string, DocumentIndex>;
  /**
   * Final nodes collected during classification, before publication.
   *
   * @internal
   */
  runtimeCandidates: ReadonlyMap<
    string,
    readonly DocumentChangeRuntimeCandidate[]
  >;
}>;

export type DocumentChangeConstructionPolicy = (
  input: Readonly<{
    after: JsonEditorValue;
    before: JsonEditorValue;
    change: DocumentChange;
    indexedAfter: ReadonlyMap<string, DocumentIndex>;
    indexedBefore: ReadonlyMap<string, DocumentIndex>;
    /**
     * Present when the schema tracks places: the steps since the last
     * finalize, and where the pass records each value it drops because the
     * node carried it from a place that left it out. In a `view`, a draft a
     * recorder judges where it stores the content, the pass drops and records
     * every value its place cannot hold instead.
     */
    carried?: Readonly<{
      drops: CarriedDrop[];
      steps: readonly DraftStep[];
      view: boolean;
    }>;
  }>,
  preparation?: object
) => DocumentChange;

/** @internal */
export type DraftStepOrigin =
  | 'canonical'
  | 'change'
  | 'insert-node'
  | 'merge'
  | 'migration'
  | 'move'
  | 'props'
  | 'remove-node'
  | 'replace'
  | 'root'
  | 'slice'
  | 'split'
  | 'text'
  | 'unwrap'
  | 'wrap';

// Canonical construction or a migration inside a scope is never the edit the
// scope names.
export const UNSCOPED_ORIGINS: ReadonlySet<DraftStepOrigin> = new Set([
  'canonical',
  'migration',
]);

const isClassified = (change: DocumentChange) =>
  [...getInternalDocumentChangeEntries(change)].every(([root]) =>
    getInternalDocumentChangeClassification(change, root)
  );

/**
 * Whether a step comes from a plugin correction, whatever primitive wrote it.
 *
 * @internal
 */
export type DraftStepSource = 'command' | 'correction';

/** @internal */
export type DraftStepMove = Readonly<{
  role: 'landing' | 'source';
}>;

/** @internal */
export type DraftStep = Readonly<{
  indexedAfter: ReadonlyMap<string, DocumentIndex>;
  indexedBefore: ReadonlyMap<string, DocumentIndex>;
  change: DocumentChange;
  move: DraftStepMove | null;
  origin: DraftStepOrigin;
  source: DraftStepSource;
  /** Runs this step landed from another place, when the schema tracks places. */
  relocations?: readonly Relocation[];
  /** Values a canonical step dropped because their nodes carried them. */
  drops?: readonly CarriedDrop[];
  /** The composition whose claimed text write applied this step. */
  composition?: CompositionStamp;
  /** Letters this step's author wrote, in its after document. */
  letters?: NewLetters;
}>;

/** @internal */
export type CompletedTextDeletion = Readonly<{
  fromBefore: number;
  pathBefore: readonly number[];
  root: string;
  toBefore: number;
}>;

export type PreparedDocumentChange = Readonly<{
  after: JsonEditorValue;
  authority: object;
  before: JsonEditorValue;
  canonical: boolean;
  change: DocumentChange;
  steps: readonly DraftStep[];
  indexedAfter: ReadonlyMap<string, DocumentIndex>;
  indexedBefore: ReadonlyMap<string, DocumentIndex>;
  indexes: ReadonlyMap<string, DocumentIndex>;
  revision?: object;
  runtimeCandidates: ReadonlyMap<
    string,
    readonly DocumentChangeRuntimeCandidate[]
  >;
}>;

export const PREPARED_DOCUMENT_CHANGES = new WeakMap<
  object,
  PreparedDocumentChange
>();

/** Builds and applies canonical document steps against one immutable draft. */
export class ChangeDraft {
  private accumulated: DocumentChange;
  private readonly appliedSteps: DraftStep[] = [];
  private stepComposition: CompositionStamp | null = null;
  private stepMove: DraftStepMove | null = null;
  private keepsLetters = false;
  private marks: NewLetters = new Map();
  private stepOrigin: DraftStepOrigin | null = null;
  private stepSource: DraftStepSource = 'command';
  private readonly assertCanonical?: (
    value: JsonEditorValue,
    change: DocumentChange
  ) => void;
  private readonly adoptCanonicalBaseline?: (value: JsonEditorValue) => void;
  private canonical = true;
  private validationPending = false;
  private readonly construct?: DocumentChangeConstructionPolicy;
  private current: JsonEditorValue;
  private readonly indexes = new Map<string, DocumentIndex>();
  private readonly isSetValued: DocumentSetPropertyResolver;
  private readonly indexConstructedRoot?: (
    input: Readonly<{
      after: DocumentIndex;
      before: DocumentIndex;
      change?: RootChange;
      root: string;
    }>
  ) => void;
  private readonly preparationRevision?: () => object;
  private readonly source: JsonEditorValue;
  private readonly sourceIndexes = new Map<string, DocumentIndex>();
  private readonly preparationAuthority: object;
  private readonly trackChanges: boolean;
  readonly tracksPlaces: boolean;
  /** Whether a collaboration binding reads which letters are new or moved. */
  readonly tracksLetters: boolean;
  private readonly view?: () => boolean;
  /** The first step after the last finalize, where a recording span starts. */
  private spanStart = 0;
  private readonly runtimeCandidatesByChange = new WeakMap<
    DocumentChange,
    ReadonlyMap<string, readonly DocumentChangeRuntimeCandidate[]>
  >();
  private readonly validate?: (
    value: JsonEditorValue,
    change: DocumentChange
  ) => void;
  private readonly validateConstructed?: (
    input: Readonly<{
      after: JsonEditorValue;
      before: JsonEditorValue;
      change: DocumentChange;
      indexedAfter: ReadonlyMap<string, DocumentIndex>;
      indexedBefore: ReadonlyMap<string, DocumentIndex>;
    }>
  ) => void;
  private readonly checkConstructed?: (
    input: Parameters<DocumentChangeConstructionPolicy>[0]
  ) => void;

  constructor(
    value: JsonEditorValue,
    options: Readonly<{
      adoptCanonicalBaseline?: (value: JsonEditorValue) => void;
      assertCanonical?: (
        value: JsonEditorValue,
        change: DocumentChange
      ) => void;
      construct?: DocumentChangeConstructionPolicy;
      indexConstructedRoot?: (
        input: Readonly<{
          after: DocumentIndex;
          before: DocumentIndex;
          change?: RootChange;
          root: string;
        }>
      ) => void;
      isSetValued?: DocumentSetPropertyResolver;
      preparationAuthority?: object;
      preparationRevision?: () => object;
      trackChanges?: boolean;
      tracksPlaces?: boolean;
      tracksLetters?: boolean;
      /** Whether the draft is a view a recorder judges; see `carried`. */
      view?: () => boolean;
      validate?: (value: JsonEditorValue, change: DocumentChange) => void;
      validateConstructed?: (
        input: Readonly<{
          after: JsonEditorValue;
          before: JsonEditorValue;
          change: DocumentChange;
          indexedAfter: ReadonlyMap<string, DocumentIndex>;
          indexedBefore: ReadonlyMap<string, DocumentIndex>;
        }>
      ) => void;
      checkConstructed?: (
        input: Parameters<DocumentChangeConstructionPolicy>[0]
      ) => void;
    }> = {}
  ) {
    this.source = value;
    this.current = value;
    this.adoptCanonicalBaseline = options.adoptCanonicalBaseline;
    this.assertCanonical = options.assertCanonical;
    this.construct = options.construct;
    this.indexConstructedRoot = options.indexConstructedRoot;
    this.isSetValued = options.isSetValued ?? (() => false);
    this.preparationAuthority =
      options.preparationAuthority ?? Object.freeze({});
    this.preparationRevision = options.preparationRevision;
    this.trackChanges = options.trackChanges ?? true;
    this.tracksPlaces = options.tracksPlaces ?? false;
    this.tracksLetters = options.tracksLetters ?? false;
    this.view = options.view;
    this.validate = options.validate;
    this.validateConstructed = options.validateConstructed;
    this.checkConstructed = options.checkConstructed;
    this.accumulated = DocumentChange.empty;
  }

  get change() {
    return this.accumulated;
  }

  /** Canonical steps retain movement identity lost by composition. @internal */
  get steps(): readonly DocumentChange[] {
    return this.appliedSteps.map((step) => step.change);
  }

  /** @internal */
  get draftSteps(): readonly DraftStep[] {
    return this.appliedSteps;
  }

  /** @internal */
  completedTextDeletion(): CompletedTextDeletion | null {
    const split = this.appliedSteps.findIndex(
      (step) => step.origin === 'canonical'
    );

    if (split <= 0) return null;

    const own = this.appliedSteps.slice(0, split);
    const completion = this.appliedSteps.slice(split);

    if (
      completion.some((step) => step.origin !== 'canonical') ||
      own.some(
        ({ change }) =>
          change.createRoots.size > 0 || change.deleteRoots.size > 0
      )
    ) {
      return null;
    }

    const change = own.reduce<DocumentChange>(
      (composed, step) => composed.compose(step.change),
      DocumentChange.empty
    );
    const [root, ...otherRoots] = getInternalDocumentChangeRootKeys(change);

    if (!root || otherRoots.length > 0) return null;

    const before = own
      .find((step) => step.indexedBefore.has(root))
      ?.indexedBefore.get(root);

    if (!before) return null;

    const range = getInternalDocumentRootChange(change, root)?.pureDeletionOn(
      before
    );

    if (!range) return null;

    const leaf = before
      .nodeRangesTouching(range[0], range[1])
      .find(
        (node) =>
          node.kind === 'text' &&
          node.contentFrom === range[0] &&
          node.contentTo === range[1]
      );

    return leaf
      ? Object.freeze({
          fromBefore: range[0],
          pathBefore: leaf.path,
          root,
          toBefore: range[1],
        })
      : null;
  }

  /** @internal */
  get recordsRelocations() {
    return this.tracksPlaces || this.tracksLetters;
  }

  /** @internal */
  get marksLetters() {
    return this.tracksLetters && !this.keepsLetters;
  }

  /** The letters a user wrote, in the draft's current document. @internal */
  get newLetters(): NewLetters {
    return this.marks;
  }

  /**
   * Keep the steps of a draft this one replaces, such as a schema rebind that
   * replays the accumulated change, so each original step stays recordable.
   *
   * @internal
   */
  keepSteps(from: ChangeDraft) {
    this.appliedSteps.length = 0;
    this.appliedSteps.push(...from.appliedSteps);
    this.marks = from.marks;
    this.spanStart = from.spanStart;
  }

  /**
   * Start a recording span after the steps applied so far, such as a recorded
   * change, which already decided every value it carried.
   *
   * @internal
   */
  beginSpan() {
    this.spanStart = this.appliedSteps.length;
  }

  private originOf(origin: DraftStepOrigin | undefined): DraftStepOrigin {
    return origin && UNSCOPED_ORIGINS.has(origin)
      ? origin
      : (this.stepOrigin ?? origin ?? 'change');
  }

  /** Label the steps `run` applies, such as a wrap built as a replacement. @internal */
  withOrigin<T>(origin: DraftStepOrigin, run: () => T): T {
    const previous = this.stepOrigin;

    this.stepOrigin = origin;
    try {
      return run();
    } finally {
      this.stepOrigin = previous;
    }
  }

  /** @internal */
  withSource<T>(source: DraftStepSource, run: () => T): T {
    const previous = this.stepSource;

    this.stepSource = source;
    try {
      return run();
    } finally {
      this.stepSource = previous;
    }
  }

  /** Tag the steps `run` applies as a composition's claimed write. @internal */
  withComposition<T>(stamp: CompositionStamp, run: () => T): T {
    const previous = this.stepComposition;

    this.stepComposition = stamp;
    try {
      return run();
    } finally {
      this.stepComposition = previous;
    }
  }

  private composed(step: DraftStep): DraftStep {
    return this.stepComposition && !step.composition
      ? { ...step, composition: this.stepComposition }
      : step;
  }

  private land(step: DraftStep) {
    this.appliedSteps.push(step);
    if (this.marks.size === 0 && !step.letters) return;

    const marks = landMarks(this.marks, step);

    for (const [root, spans] of step.letters ?? []) {
      marks.set(root, mergeSpans([...(marks.get(root) ?? []), ...spans]));
    }
    this.marks = marks;
  }

  /**
   * Leave the letters `run` writes unmarked, because it read them from the
   * document, so they keep their identity in a binding.
   *
   * @internal
   */
  withKeptLetters<T>(run: () => T): T {
    const previous = this.keepsLetters;

    this.keepsLetters = true;
    try {
      return run();
    } finally {
      this.keepsLetters = previous;
    }
  }

  /**
   * Mark the text between the positions `from` and `to` as written by the
   * last step, when that step came after the draft's first `since` steps.
   *
   * @internal
   */
  markLetters(since: number, root: string, from: number, to: number) {
    const last = this.appliedSteps.length - 1;
    const step = this.appliedSteps[last];

    if (!this.marksLetters || last < since) return;
    const spans = textSpansIn(this.getIndex(root), from, to);

    if (spans.length === 0) return;

    const marks = new Map(this.marks);

    marks.set(root, mergeSpans([...(marks.get(root) ?? []), ...spans]));
    this.marks = marks;
    this.appliedSteps[last] = {
      ...step,
      letters: new Map(step.letters).set(
        root,
        mergeSpans([...(step.letters?.get(root) ?? []), ...spans])
      ),
    };
  }

  /** @internal */
  withMove<T>(move: DraftStepMove, run: () => T): T {
    const previous = this.stepMove;

    this.stepMove = move;
    try {
      return run();
    } finally {
      this.stepMove = previous;
    }
  }

  get value() {
    return this.current;
  }

  /**
   * Reuse the builder's canonical indexes for publication.
   *
   * @internal
   */
  indexedAfter(change: DocumentChange = this.accumulated) {
    const result = new Map<string, DocumentIndex>();

    for (const [root] of getInternalDocumentChangeEntries(change)) {
      if (!change.deleteRoots.has(root)) result.set(root, this.getIndex(root));
    }
    for (const root of change.createRoots) {
      result.set(root, this.getIndex(root));
    }

    return result;
  }

  /**
   * Fork the current draft while sharing its immutable indexes.
   *
   * @internal
   */
  fork(options: Readonly<{ validation?: 'defer-to-parent' | 'inherit' }> = {}) {
    const fork = new ChangeDraft(this.current, {
      assertCanonical: this.assertCanonical,
      adoptCanonicalBaseline: this.adoptCanonicalBaseline,
      construct: this.construct,
      indexConstructedRoot: this.indexConstructedRoot,
      isSetValued: this.isSetValued,
      preparationAuthority: this.preparationAuthority,
      preparationRevision: this.preparationRevision,
      trackChanges: this.trackChanges,
      tracksPlaces: this.tracksPlaces,
      tracksLetters: this.tracksLetters,
      view: this.view,
      checkConstructed: this.checkConstructed,
      ...(options.validation === 'defer-to-parent'
        ? {}
        : {
            validate: this.validate,
            validateConstructed: this.validateConstructed,
          }),
    });

    for (const [root, index] of this.indexes) {
      fork.indexes.set(root, index);
      fork.sourceIndexes.set(root, index);
    }
    fork.canonical = this.canonical;
    fork.validationPending = this.validationPending;
    return fork;
  }

  check() {
    if (!this.accumulated.empty) {
      this.checkConstructed?.(this.validationInput());
    }
  }

  /**
   * Require the parent transaction to validate an adopted canonical draft.
   *
   * @internal
   */
  requireValidation() {
    if (!this.accumulated.empty) this.validationPending = true;
  }

  /**
   * Capture the finalized draft behind an opaque token.
   *
   * @internal
   */
  prepare(
    change: DocumentChange = this.classify(),
    options: Readonly<{ classify?: boolean }> = {}
  ): object {
    if (!this.canonical) {
      throw new Error('Cannot prepare a non-canonical document draft.');
    }
    const classifiedChange =
      options.classify === false ? change : this.classify(change);
    const indexedAfter = new Map<string, DocumentIndex>();
    const indexedBefore = new Map<string, DocumentIndex>();

    for (const [root] of getInternalDocumentChangeEntries(classifiedChange)) {
      indexedBefore.set(root, this.getSourceIndex(root));
      indexedAfter.set(
        root,
        classifiedChange.deleteRoots.has(root)
          ? DocumentIndex.fromValue([])
          : this.getIndex(root)
      );
    }

    const token = Object.freeze({});

    PREPARED_DOCUMENT_CHANGES.set(
      token,
      Object.freeze({
        after: this.current,
        authority: this.preparationAuthority,
        before: this.source,
        canonical: this.canonical,
        change: classifiedChange,
        steps: Object.freeze([...this.appliedSteps]),
        indexedAfter,
        indexedBefore,
        indexes: new Map(this.indexes),
        revision: this.preparationRevision?.(),
        runtimeCandidates:
          this.runtimeCandidatesByChange.get(classifiedChange) ?? new Map(),
      })
    );

    return token;
  }

  /**
   * Adopt a trusted prepared fork without replaying its changes.
   *
   * @internal
   */
  adopt(prepared: object): DocumentChangeStep | null {
    const payload = PREPARED_DOCUMENT_CHANGES.get(prepared);

    if (
      !payload ||
      payload.authority !== this.preparationAuthority ||
      payload.before !== this.current ||
      !payload.canonical ||
      payload.revision !== this.preparationRevision?.()
    ) {
      return null;
    }

    const before = this.current;
    const accumulated = this.accumulated.empty
      ? payload.change
      : this.accumulated.compose(payload.change, this.source);

    for (const [root, index] of payload.indexes) {
      this.indexes.set(root, index);
    }
    for (const root of payload.change.deleteRoots) {
      this.indexes.delete(root);
    }

    this.accumulated = accumulated;
    for (const step of payload.steps) {
      if (!this.stepMove || step.move) {
        this.land(this.composed(step));
        continue;
      }
      const { letters, ...rest } = step;
      const moved = { ...rest, move: this.stepMove };
      // A move fits its landing in a prepared fork, whose paste path marks
      // the landed letters as new. A move carries only letters read from the
      // document, so its landing keeps no marks.
      const landing = this.stepMove.role === 'landing';

      this.land(
        this.composed(letters && !landing ? { ...moved, letters } : moved)
      );
    }
    if (accumulated === payload.change) {
      this.runtimeCandidatesByChange.set(
        accumulated,
        payload.runtimeCandidates
      );
    }
    this.canonical = true;
    this.current = payload.after;

    return Object.freeze({
      after: payload.after,
      before,
      change: payload.change,
      indexedAfter: payload.indexedAfter,
      indexedBefore: payload.indexedBefore,
      runtimeCandidates: payload.runtimeCandidates,
    });
  }

  /** Classify a transaction-wide change against cached source/current indexes. */
  classify(change: DocumentChange = this.accumulated) {
    const cachedRuntimeCandidates = this.runtimeCandidatesByChange.get(change);

    if (cachedRuntimeCandidates && isClassified(change)) return change;

    const classifications = new Map<string, DocumentChangeRootClassification>();
    const runtimeCandidates = new Map<
      string,
      readonly DocumentChangeRuntimeCandidate[]
    >();

    for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
      const classified = classifyRootChangeWithRuntimeCandidates(
        rootChange,
        this.getSourceIndex(root),
        this.getIndex(root)
      );

      classifications.set(root, classified.classification);
      runtimeCandidates.set(root, classified.runtimeCandidates);
    }

    const classifiedChange = createInternalDocumentChange(
      new Map(getInternalDocumentChangeEntries(change)),
      {
        classifications,
        createRoots: change.createRoots,
        deleteRoots: change.deleteRoots,
        records: getInternalDocumentChangeRecords(change),
      }
    );

    this.runtimeCandidatesByChange.set(
      classifiedChange,
      freezeReadonlyMap(runtimeCandidates)
    );

    return classifiedChange;
  }

  apply(
    change: DocumentChange,
    options: Readonly<{
      classify?: boolean;
      drops?: readonly CarriedDrop[];
      indexedAfter?: ReadonlyMap<string, DocumentIndex>;
      letters?: NewLetters;
      origin?: DraftStepOrigin;
      relocations?: readonly Relocation[];
    }> = {}
  ): DocumentChangeStep {
    const before = this.current;
    const classifications = new Map<string, DocumentChangeRootClassification>();
    const indexedAfter = new Map<string, DocumentIndex>();
    const indexedBefore = new Map<string, DocumentIndex>();
    const runtimeCandidates = new Map<
      string,
      readonly DocumentChangeRuntimeCandidate[]
    >();

    for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
      const beforeRoot = this.getIndex(root);
      const after =
        options.indexedAfter?.get(root) ?? rootChange.apply(beforeRoot);

      if (after.length !== rootChange.newLength) {
        throw new Error(
          `Indexed result for root "${root}" does not match change length.`
        );
      }

      this.indexConstructedRoot?.({
        after,
        before: beforeRoot,
        change: rootChange,
        root,
      });

      if (options.classify !== false) {
        const classified = classifyRootChangeWithRuntimeCandidates(
          rootChange,
          beforeRoot,
          after
        );

        classifications.set(root, classified.classification);
        runtimeCandidates.set(root, classified.runtimeCandidates);
      } else {
        runtimeCandidates.set(root, Object.freeze([]));
      }
      indexedBefore.set(root, beforeRoot);
      indexedAfter.set(root, after);
    }

    const classifiedChange = createInternalDocumentChange(
      new Map(getInternalDocumentChangeEntries(change)),
      {
        classifications,
        createRoots: change.createRoots,
        deleteRoots: change.deleteRoots,
        records: getInternalDocumentChangeRecords(change),
      }
    );
    const frozenRuntimeCandidates = freezeReadonlyMap(runtimeCandidates);

    if (options.classify !== false) {
      this.runtimeCandidatesByChange.set(
        classifiedChange,
        frozenRuntimeCandidates
      );
    }

    const current = applyDocumentChangeWithIndexes(
      classifiedChange,
      this.current,
      indexedAfter
    );

    for (const [root, after] of indexedAfter) {
      this.indexes.set(root, after);
    }

    for (const root of change.createRoots) {
      if (!this.indexes.has(root)) {
        const after = valueRootIndex(current, root);
        const beforeRoot = this.getSourceIndex(root);

        this.indexes.set(root, after);
        indexedAfter.set(root, after);
        indexedBefore.set(root, beforeRoot);
        this.indexConstructedRoot?.({ after, before: beforeRoot, root });
      }
    }
    for (const root of change.deleteRoots) {
      this.indexes.delete(root);
    }

    if (this.trackChanges) {
      this.accumulated = this.accumulated.empty
        ? classifiedChange
        : this.accumulated.compose(classifiedChange, this.source);
      if (!classifiedChange.empty) {
        const relocations = this.recordsRelocations
          ? options.relocations
          : undefined;

        this.land(
          this.composed({
            indexedAfter,
            indexedBefore,
            change: classifiedChange,
            move: this.stepMove,
            origin: this.originOf(options.origin),
            source: this.stepSource,
            ...(relocations?.length ? { relocations } : {}),
            ...(options.drops?.length ? { drops: options.drops } : {}),
            ...(options.letters ? { letters: options.letters } : {}),
          })
        );
        countCoreWork('relocations', relocations?.length ?? 0);
      }
    }
    this.canonical = false;
    this.current = current;

    return Object.freeze({
      after: current,
      before,
      change: classifiedChange,
      indexedAfter,
      indexedBefore,
      runtimeCandidates: frozenRuntimeCandidates,
    });
  }

  /** Apply an externally supplied change that must already be publishable. */
  applyCanonical(change: DocumentChange): DocumentChangeStep {
    if (!this.validate && !this.validateConstructed && !this.assertCanonical) {
      const step = this.apply(change);

      this.canonical = true;

      return step;
    }

    // Validate an isolated draft, then publish those exact indexed roots.
    // A rejected change must not mutate this builder or its owner indexes.
    const candidateBuilder = new ChangeDraft(this.current, {
      isSetValued: this.isSetValued,
    });
    const candidate = candidateBuilder.apply(change);
    const accumulated = this.accumulated.empty
      ? candidate.change
      : this.accumulated.compose(candidate.change, this.source);

    if (this.validateConstructed) {
      // Earlier draft steps may be unvalidated; retain the transaction baseline.
      const indexedAfter = candidateBuilder.indexedAfter(accumulated);
      const indexedBefore = new Map<string, DocumentIndex>();

      for (const root of indexedAfter.keys()) {
        indexedBefore.set(root, this.getSourceIndex(root));
      }
      if (
        this.validate &&
        this.hasUnindexedRootChange(candidate.after, indexedAfter)
      ) {
        this.validate(candidate.after, accumulated);
      } else {
        this.validateConstructed({
          after: candidate.after,
          before: this.source,
          change: accumulated,
          indexedAfter,
          indexedBefore,
        });
      }
    } else {
      this.validate?.(candidate.after, accumulated);
    }
    this.assertCanonical?.(candidate.after, accumulated);

    return this.applyTrustedCanonical(candidate.change, {
      indexedAfter: candidate.indexedAfter,
      runtimeCandidates: candidate.runtimeCandidates,
    });
  }

  /**
   * Apply a schema-fitted canonical change without revalidation.
   *
   * A fitter that already constructed the exact immutable target indexes may
   * supply them to avoid replaying the same change. Length and root lifecycle
   * checks still bind every supplied index to this builder's current draft.
   *
   * @internal
   */
  applyTrustedCanonical(
    change: DocumentChange,
    options: Readonly<{
      indexedAfter?: ReadonlyMap<string, DocumentIndex>;
      origin?: DraftStepOrigin;
      runtimeCandidates?: ReadonlyMap<
        string,
        readonly DocumentChangeRuntimeCandidate[]
      >;
    }> = {}
  ): DocumentChangeStep {
    if (!options.indexedAfter) {
      const step = this.apply(change, {
        classify: false,
        origin: options.origin,
      });

      this.runtimeCandidatesByChange.set(step.change, step.runtimeCandidates);
      this.canonical = true;

      return step;
    }

    const before = this.current;
    const indexedAfter = new Map<string, DocumentIndex>();
    const indexedBefore = new Map<string, DocumentIndex>();
    const runtimeCandidates = new Map<
      string,
      readonly DocumentChangeRuntimeCandidate[]
    >();
    const entries = new Map(getInternalDocumentChangeEntries(change));

    for (const [root, rootChange] of entries) {
      const beforeRoot = this.getIndex(root);
      const afterRoot = options.indexedAfter.get(root);

      if (change.deleteRoots.has(root)) {
        if (!afterRoot) {
          throw new Error(
            `Missing trusted indexed result for deleted root "${root}".`
          );
        }
        if (
          rootChange.length !== beforeRoot.length ||
          rootChange.newLength !== 0 ||
          afterRoot.length !== 0
        ) {
          throw new Error(
            `Trusted deletion for root "${root}" does not match change lengths.`
          );
        }

        indexedBefore.set(root, beforeRoot);
        indexedAfter.set(root, afterRoot);
        this.indexConstructedRoot?.({
          after: afterRoot,
          before: beforeRoot,
          change: rootChange,
          root,
        });
        runtimeCandidates.set(
          root,
          options.runtimeCandidates?.get(root) ?? Object.freeze([])
        );
        continue;
      }

      if (!afterRoot) {
        throw new Error(
          `Missing trusted indexed result for changed root "${root}".`
        );
      }
      if (
        rootChange.length !== beforeRoot.length ||
        rootChange.newLength !== afterRoot.length
      ) {
        throw new Error(
          `Trusted indexed result for root "${root}" does not match change lengths.`
        );
      }

      indexedBefore.set(root, beforeRoot);
      indexedAfter.set(root, afterRoot);
      this.indexConstructedRoot?.({
        after: afterRoot,
        before: beforeRoot,
        change: rootChange,
        root,
      });
      runtimeCandidates.set(
        root,
        options.runtimeCandidates?.get(root) ?? Object.freeze([])
      );
    }

    for (const root of change.createRoots) {
      if (root === 'main' || Object.hasOwn(this.current.roots ?? {}, root)) {
        throw new Error(`Cannot create editor root ${root}.`);
      }

      const rootChange = entries.get(root);
      const afterRoot =
        options.indexedAfter.get(root) ?? DocumentIndex.fromValue([]);

      if (
        (rootChange && rootChange.newLength !== afterRoot.length) ||
        (!rootChange && afterRoot.length !== 0)
      ) {
        throw new Error(
          `Trusted indexed result for created root "${root}" does not match its change.`
        );
      }

      indexedBefore.set(root, this.getSourceIndex(root));
      indexedAfter.set(root, afterRoot);
      this.indexConstructedRoot?.({
        after: afterRoot,
        before: this.getSourceIndex(root),
        change: rootChange,
        root,
      });
      runtimeCandidates.set(
        root,
        options.runtimeCandidates?.get(root) ?? Object.freeze([])
      );
    }

    for (const root of change.deleteRoots) {
      if (root === 'main' || !Object.hasOwn(this.current.roots ?? {}, root)) {
        throw new Error(`Cannot delete editor root ${root}.`);
      }
      indexedBefore.set(root, this.getIndex(root));
    }

    for (const root of options.indexedAfter.keys()) {
      if (!entries.has(root) && !change.createRoots.has(root)) {
        throw new Error(
          `Trusted indexed result targets unchanged root "${root}".`
        );
      }
    }

    const classifications = new Map<string, DocumentChangeRootClassification>();

    for (const [root] of entries) {
      const classification = getInternalDocumentChangeClassification(
        change,
        root
      );

      if (classification) classifications.set(root, classification);
    }

    const canonicalChange = createInternalDocumentChange(entries, {
      classifications,
      createRoots: change.createRoots,
      deleteRoots: change.deleteRoots,
      records: getInternalDocumentChangeRecords(change),
    });
    const frozenRuntimeCandidates = freezeReadonlyMap(runtimeCandidates);
    const current = applyDocumentChangeWithIndexes(
      canonicalChange,
      this.current,
      indexedAfter
    );

    for (const [root, afterRoot] of indexedAfter) {
      this.indexes.set(root, afterRoot);
    }
    for (const root of change.deleteRoots) {
      this.indexes.delete(root);
    }

    this.accumulated = this.accumulated.empty
      ? canonicalChange
      : this.accumulated.compose(canonicalChange, this.source);
    if (!canonicalChange.empty) {
      this.land(
        this.composed({
          indexedAfter,
          indexedBefore,
          change: canonicalChange,
          move: this.stepMove,
          origin: this.originOf(options.origin),
          source: this.stepSource,
        })
      );
    }
    this.runtimeCandidatesByChange.set(
      canonicalChange,
      frozenRuntimeCandidates
    );
    if (change !== canonicalChange) {
      this.runtimeCandidatesByChange.set(change, frozenRuntimeCandidates);
    }
    this.canonical = true;
    this.current = current;
    this.adoptCanonicalBaseline?.(current);

    return Object.freeze({
      after: current,
      before,
      change: canonicalChange,
      indexedAfter,
      indexedBefore,
      runtimeCandidates: frozenRuntimeCandidates,
    });
  }

  /**
   * Construct and validate the canonical result of the accumulated draft.
   * Primitive edits may temporarily produce non-canonical structure; only the
   * transaction boundary is a publishable document.
   */
  finalize(
    preparation?: object,
    options: Readonly<{ classify?: boolean; origin?: DraftStepOrigin }> = {}
  ): DocumentChangeStep | null {
    if (this.canonical && !this.validationPending) return null;

    let constructionChange: DocumentChange | undefined;
    const drops: CarriedDrop[] = [];

    if (!this.canonical && this.construct) {
      const steps = this.appliedSteps.slice(this.spanStart);

      constructionChange = this.construct(
        this.tracksPlaces
          ? {
              ...this.validationInput(),
              carried: {
                drops,
                steps,
                view: steps.length > 0 && (this.view?.() ?? false),
              },
            }
          : this.validationInput(),
        preparation
      );
    }
    const classified = isClassified(this.accumulated);
    const step =
      constructionChange && !constructionChange.empty
        ? this.apply(constructionChange, {
            ...options,
            drops,
            origin: options.origin ?? 'canonical',
          })
        : null;

    this.spanStart = this.appliedSteps.length;

    // Composing the correction drops the classification of each root both
    // changes write, because their paths read in two documents, and a commit
    // without one reads its roots whole to answer what changed.
    if (
      step &&
      classified &&
      options.classify !== false &&
      !this.accumulated.empty
    ) {
      this.accumulated = this.classify(this.accumulated);
    }

    if (this.accumulated.empty) {
      this.current = this.source;
      this.indexes.clear();
      for (const [root, index] of this.sourceIndexes) {
        this.indexes.set(root, index);
      }
      this.canonical = true;
      this.validationPending = false;

      if (!step) return null;
      const indexedAfter = new Map(step.indexedAfter);
      const runtimeCandidates = new Map<
        string,
        readonly DocumentChangeRuntimeCandidate[]
      >();

      for (const [root, rootChange] of getInternalDocumentChangeEntries(
        step.change
      )) {
        const sourceIndex = this.getSourceIndex(root);

        indexedAfter.set(root, sourceIndex);
        if (options.classify !== false) {
          runtimeCandidates.set(
            root,
            classifyRootChangeWithRuntimeCandidates(
              rootChange,
              getDefined(step.indexedBefore.get(root)),
              sourceIndex
            ).runtimeCandidates
          );
        }
      }

      return Object.freeze({
        ...step,
        after: this.source,
        indexedAfter,
        runtimeCandidates: freezeReadonlyMap(runtimeCandidates),
      });
    }

    if (this.validateConstructed) {
      const input = this.validationInput();

      if (
        this.validate &&
        this.hasUnindexedRootChange(input.after, input.indexedAfter)
      ) {
        this.validate(this.current, this.accumulated);
      } else {
        this.validateConstructed(input);
      }
    } else {
      this.validate?.(this.current, this.accumulated);
    }
    this.canonical = true;
    this.validationPending = false;

    return step;
  }

  createRoot(root: string, children: readonly JsonNode[]) {
    if (root === 'main' || Object.hasOwn(this.current.roots ?? {}, root)) {
      throw new Error(`Cannot create editor root ${root}.`);
    }

    const document = DocumentIndex.fromValue([]);
    const rootChange = replaceChildrenChange(document, [], 0, 0, children);

    return this.applyConstructed(
      createInternalDocumentChange(
        rootChange.empty ? new Map() : new Map([[root, rootChange]]),
        {
          createRoots: [root],
        }
      ),
      'root'
    );
  }

  deleteRoot(root: string) {
    if (root === 'main' || !Object.hasOwn(this.current.roots ?? {}, root)) {
      throw new Error(`Cannot delete editor root ${root}.`);
    }

    const document = this.getIndex(root);
    const rootChange = replaceChildrenChange(
      document,
      [],
      0,
      document.value.length,
      []
    );

    return this.applyConstructed(
      createInternalDocumentChange(
        rootChange.empty ? new Map() : new Map([[root, rootChange]]),
        {
          deleteRoots: [root],
        }
      ),
      'root'
    );
  }

  insertNode(root: string, path: readonly number[], node: JsonNode) {
    const document = this.getIndex(root);

    return this.applyRoot(
      root,
      'insert-node',
      insertNodeChange(document, path, node),
      document.withInsertedNode(path, node)
    );
  }

  insertText(
    root: string,
    path: readonly number[],
    offset: number,
    text: string
  ) {
    const document = this.getIndex(root);
    const from = this.marksLetters
      ? document.positionAt({ path, offset })
      : null;

    return this.applyRoot(
      root,
      'text',
      insertTextChange(document, path, offset, text),
      document.withText(path, offset, offset, text),
      undefined,
      from === null ? undefined : [[from, from + text.length]]
    );
  }

  mergeNode(root: string, path: readonly number[]) {
    return this.applyRoot(
      root,
      'merge',
      mergeNodeChange(this.getIndex(root), path)
    );
  }

  moveNode(
    root: string,
    path: readonly number[],
    newPath: readonly number[],
    options: Readonly<{ preservesRepresentation?: boolean }> = {}
  ) {
    const document = this.getIndex(root);
    const wasCanonical = this.canonical;
    const change = moveNodeChange(document, path, newPath);
    const step = this.applyRoot(
      root,
      'move',
      change,
      undefined,
      this.recordsRelocations
        ? this.movedRun(root, document, path, change)
        : undefined
    );

    if (wasCanonical && options.preservesRepresentation) {
      this.canonical = true;
      this.validationPending = true;
    }

    return step;
  }

  removeNode(root: string, path: readonly number[]) {
    const document = this.getIndex(root);

    return this.applyRoot(
      root,
      'remove-node',
      removeNodeChange(document, path),
      document.withRemovedNode(path)
    );
  }

  removeText(
    root: string,
    path: readonly number[],
    offset: number,
    text: string
  ) {
    const document = this.getIndex(root);
    const node = document.node(path);

    if (
      !isTextNode(node) ||
      node.text.slice(offset, offset + text.length) !== text
    ) {
      throw new Error(`Removed text does not match the draft at [${path}].`);
    }

    return this.applyRoot(
      root,
      'text',
      removeTextChange(document, path, offset, text)
    );
  }

  replaceChildren(
    root: string,
    path: readonly number[],
    index: number,
    removeCount: number,
    children: readonly JsonNode[]
  ) {
    const document = this.getIndex(root);
    const after = document.withSplicedNodes(path, index, removeCount, children);

    return this.applyRoot(
      root,
      'replace',
      replaceChildrenChange(document, path, index, removeCount, children),
      after,
      this.recordsRelocations
        ? this.reusedRuns(
            root,
            document,
            after,
            path,
            index,
            removeCount,
            children
          )
        : undefined
    );
  }

  replaceChildRuns(root: string, runs: readonly ChildRun[]) {
    return this.applyRoot(
      root,
      'replace',
      replaceChildRunsChange(this.getIndex(root), runs)
    );
  }

  replaceRoot(root: string, children: readonly JsonNode[]) {
    if (root !== 'main' && !Object.hasOwn(this.current.roots ?? {}, root)) {
      throw new Error(`Cannot replace editor root ${root}.`);
    }

    const document = this.getIndex(root);

    return this.applyRoot(
      root,
      'replace',
      reconcileChildrenStep(document, [], 0, document.value.length, children)
        .change
    );
  }

  replaceSlice(
    root: string,
    from: JsonPoint,
    to: JsonPoint,
    insert: PreparedTokenSlice
  ) {
    const document = this.getIndex(root);
    const fromPosition = document.positionAt(from);
    const toPosition = document.positionAt(to);

    if (toPosition < fromPosition) {
      throw new RangeError('A slice replacement range must be forward.');
    }

    return this.applyRoot(
      root,
      'slice',
      RootChange.create(document, {
        from: fromPosition,
        insert,
        to: toPosition,
      })
    );
  }

  setNode(
    root: string,
    path: readonly number[],
    newProperties: JsonRecord,
    properties: JsonRecord = {}
  ) {
    return this.applyRoot(
      root,
      'props',
      setNodeChange(
        this.getIndex(root),
        path,
        newProperties,
        properties,
        this.isSetValued,
        root === 'main' ? null : root
      )
    );
  }

  setNodes(
    root: string,
    updates: ReadonlyArray<
      Readonly<{
        newProperties: JsonRecord;
        path: readonly number[];
        properties: JsonRecord;
      }>
    >
  ) {
    return this.applyRoot(
      root,
      'props',
      setNodesChange(
        this.getIndex(root),
        updates,
        this.isSetValued,
        root === 'main' ? null : root
      )
    );
  }

  splitNode(
    root: string,
    path: readonly number[],
    position: number,
    properties: JsonRecord
  ) {
    const document = this.getIndex(root);

    return this.applyRoot(
      root,
      'split',
      splitNodeChange(document, path, position, properties),
      undefined,
      this.tracksPlaces
        ? this.splitRun(root, document, path, position)
        : undefined
    );
  }

  /** The moved subtree lands as one run whose source is its old range. */
  private movedRun(
    root: string,
    document: DocumentIndex,
    path: readonly number[],
    change: RootChange
  ): readonly Relocation[] {
    const { from, to } = document.nodeRange(path);
    const length = to - from;
    let after = 0;

    for (let pair = 0; pair < change.sections.length; pair += 2) {
      const removed = change.sections[pair];
      const inserted = change.sections[pair + 1];

      if (removed === 0 && inserted === length) {
        return [{ at: after, length, root, source: from }];
      }
      after += inserted < 0 ? removed : inserted;
    }

    return [];
  }

  /**
   * One run per inserted node that is, by reference, one removed child or a
   * child of one, and appears once. It looks one level deep on each side, so
   * a wrap or an unwrap matches.
   */
  private reusedRuns(
    root: string,
    document: DocumentIndex,
    after: DocumentIndex,
    path: readonly number[],
    index: number,
    removeCount: number,
    children: readonly JsonNode[]
  ): readonly Relocation[] {
    const siblings =
      path.length === 0
        ? document.nodes.slice(index, index + removeCount)
        : (document.node(path).children ?? []).slice(
            index,
            index + removeCount
          );
    const removed = new Map<object, readonly number[]>();
    const seen = new Map<object, number>();
    const matches: Array<Readonly<{ node: object; to: readonly number[] }>> =
      [];
    const match = (node: object, to: readonly number[]) => {
      matches.push({ node, to });
      seen.set(node, (seen.get(node) ?? 0) + 1);
    };

    siblings.forEach((node, offset) => {
      const at = [...path, index + offset];

      removed.set(node, at);
      node.children?.forEach((child, childIndex) => {
        removed.set(child, [...at, childIndex]);
      });
    });
    children.forEach((node, offset) => {
      const at = [...path, index + offset];

      if (removed.has(node)) {
        match(node, at);
        return;
      }
      node.children?.forEach((child, childIndex) => {
        if (removed.has(child)) match(child, [...at, childIndex]);
      });
    });

    return matches.flatMap(({ node, to }) => {
      if (seen.get(node) !== 1) return [];
      const source = document.nodeRange(getDefined(removed.get(node)));
      const landed = after.nodeRange(to);

      return [
        {
          at: landed.from,
          length: landed.to - landed.from,
          root,
          source: source.from,
        },
      ];
    });
  }

  /** The new node's open token continues the split node's. */
  private splitRun(
    root: string,
    document: DocumentIndex,
    path: readonly number[],
    position: number
  ): readonly Relocation[] {
    const node = document.node(path);
    const boundary = isTextNode(node)
      ? document.positionAt({ offset: position, path: [...path] })
      : document.childPosition(path, position);

    return [
      {
        at: boundary + 1,
        length: 1,
        root,
        source: document.nodeRange(path).from,
      },
    ];
  }

  private applyRoot(
    root: string,
    origin: DraftStepOrigin,
    change: RootChange,
    indexedAfter?: DocumentIndex,
    relocations?: readonly Relocation[],
    letters?: readonly LetterSpan[]
  ) {
    return this.apply(
      createInternalDocumentChange(
        change.empty ? new Map() : new Map([[root, change]])
      ),
      {
        indexedAfter: indexedAfter
          ? new Map([[root, indexedAfter]])
          : undefined,
        letters:
          letters?.length && this.marksLetters
            ? new Map([[root, letters]])
            : undefined,
        origin,
        relocations,
      }
    );
  }

  private applyConstructed(
    change: DocumentChange,
    origin: DraftStepOrigin,
    indexedAfter?: ReadonlyMap<string, DocumentIndex>
  ): DocumentChangeStep {
    return this.apply(change, { indexedAfter, origin });
  }

  getIndex(root: string) {
    let document = this.indexes.get(root);

    if (!document) {
      document = valueRootIndex(this.current, root);
      this.indexes.set(root, document);
    }

    return document;
  }

  private validationInput() {
    const indexedAfter = new Map<string, DocumentIndex>();
    const indexedBefore = new Map<string, DocumentIndex>();
    const touchedRoots = new Set([
      ...[...getInternalDocumentChangeEntries(this.accumulated)].map(
        ([root]) => root
      ),
      ...this.accumulated.createRoots,
    ]);

    for (const root of touchedRoots) {
      if (!this.accumulated.deleteRoots.has(root)) {
        indexedAfter.set(root, this.getIndex(root));
      }
      indexedBefore.set(root, this.getSourceIndex(root));
    }

    return {
      after: this.current,
      before: this.source,
      change: this.accumulated,
      indexedAfter,
      indexedBefore,
    };
  }

  private hasUnindexedRootChange(
    after: JsonEditorValue,
    indexedAfter: ReadonlyMap<string, DocumentIndex>
  ) {
    return (
      (rootNodesOf(after, 'children') !==
        rootNodesOf(this.source, 'children') &&
        !indexedAfter.has('main')) ||
      Object.entries(after.roots ?? {}).some(
        ([root, children]) =>
          children !== this.source.roots?.[root] && !indexedAfter.has(root)
      )
    );
  }

  private getSourceIndex(root: string) {
    let document = this.sourceIndexes.get(root);

    if (!document) {
      document = valueRootIndex(this.source, root);
      this.sourceIndexes.set(root, document);
    }

    return document;
  }
}

export const classifyDocumentChange = (
  before: JsonEditorValue,
  after: JsonEditorValue,
  change: DocumentChange
) => {
  const classifications = new Map(
    getInternalDocumentChangeClassificationEntries(change)
  );

  for (const [root, rootChange] of getInternalDocumentChangeEntries(change)) {
    classifications.set(
      root,
      classifyRootChange(
        rootChange,
        valueRootIndex(before, root),
        valueRootIndex(after, root)
      )
    );
  }

  return createInternalDocumentChange(
    new Map(getInternalDocumentChangeEntries(change)),
    {
      classifications,
      createRoots: change.createRoots,
      deleteRoots: change.deleteRoots,
      records: getInternalDocumentChangeRecords(change),
    }
  );
};
