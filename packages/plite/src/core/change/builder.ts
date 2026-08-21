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
  valueRoot,
} from './document-change';
import { DocumentIndex } from './document-index';
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
  type JsonRecord,
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
  }>,
  preparation?: object
) => DocumentChange;

export type PreparedDocumentChange = Readonly<{
  after: JsonEditorValue;
  authority: object;
  before: JsonEditorValue;
  canonical: boolean;
  change: DocumentChange;
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
    this.validate = options.validate;
    this.validateConstructed = options.validateConstructed;
    this.accumulated = DocumentChange.empty;
  }

  get change() {
    return this.accumulated;
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
    const alreadyClassified = [
      ...getInternalDocumentChangeEntries(change),
    ].every(([root]) => getInternalDocumentChangeClassification(change, root));

    if (cachedRuntimeCandidates && alreadyClassified) return change;

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
      indexedAfter?: ReadonlyMap<string, DocumentIndex>;
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
        const after = DocumentIndex.fromValue(valueRoot(current, root));
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

    this.accumulated = this.accumulated.empty
      ? classifiedChange
      : this.accumulated.compose(classifiedChange, this.source);
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
    if (!this.validate && !this.assertCanonical) {
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

    this.validate?.(candidate.after, accumulated);
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
      runtimeCandidates?: ReadonlyMap<
        string,
        readonly DocumentChangeRuntimeCandidate[]
      >;
    }> = {}
  ): DocumentChangeStep {
    if (!options.indexedAfter) {
      const step = this.apply(change, { classify: false });

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
    options: Readonly<{ classify?: boolean }> = {}
  ): DocumentChangeStep | null {
    if (this.canonical && !this.validationPending) return null;

    const before = this.current;
    let constructionChange: DocumentChange | undefined;

    if (!this.canonical && this.construct) {
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

      constructionChange = this.construct(
        {
          after: before,
          before: this.source,
          change: this.accumulated,
          indexedAfter,
          indexedBefore,
        },
        preparation
      );
    }
    const step =
      constructionChange && !constructionChange.empty
        ? this.apply(constructionChange, options)
        : null;

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
              step.indexedBefore.get(root)!,
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
      this.validateConstructed({
        after: this.current,
        before: this.source,
        change: this.accumulated,
        indexedAfter,
        indexedBefore,
      });
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
      )
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
      )
    );
  }

  insertNode(root: string, path: readonly number[], node: JsonNode) {
    const document = this.getIndex(root);

    return this.applyRoot(
      root,
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

    return this.applyRoot(
      root,
      insertTextChange(document, path, offset, text),
      document.withText(path, offset, offset, text)
    );
  }

  mergeNode(root: string, path: readonly number[]) {
    return this.applyRoot(root, mergeNodeChange(this.getIndex(root), path));
  }

  moveNode(
    root: string,
    path: readonly number[],
    newPath: readonly number[],
    options: Readonly<{ preservesRepresentation?: boolean }> = {}
  ) {
    const document = this.getIndex(root);
    const wasCanonical = this.canonical;
    const step = this.applyRoot(root, moveNodeChange(document, path, newPath));

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

    return this.applyRoot(root, removeTextChange(document, path, offset, text));
  }

  replaceChildren(
    root: string,
    path: readonly number[],
    index: number,
    removeCount: number,
    children: readonly JsonNode[]
  ) {
    const document = this.getIndex(root);

    return this.applyRoot(
      root,
      replaceChildrenChange(document, path, index, removeCount, children),
      document.withSplicedNodes(path, index, removeCount, children)
    );
  }

  replaceRoot(root: string, children: readonly JsonNode[]) {
    if (root !== 'main' && !Object.hasOwn(this.current.roots ?? {}, root)) {
      throw new Error(`Cannot replace editor root ${root}.`);
    }

    const document = this.getIndex(root);

    return this.applyRoot(
      root,
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
    updates: readonly Readonly<{
      newProperties: JsonRecord;
      path: readonly number[];
      properties: JsonRecord;
    }>[]
  ) {
    return this.applyRoot(
      root,
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
    return this.applyRoot(
      root,
      splitNodeChange(this.getIndex(root), path, position, properties)
    );
  }

  private applyRoot(
    root: string,
    change: RootChange,
    indexedAfter?: DocumentIndex
  ) {
    return this.applyConstructed(
      createInternalDocumentChange(
        change.empty ? new Map() : new Map([[root, change]])
      ),
      indexedAfter ? new Map([[root, indexedAfter]]) : undefined
    );
  }

  private applyConstructed(
    change: DocumentChange,
    indexedAfter?: ReadonlyMap<string, DocumentIndex>
  ): DocumentChangeStep {
    return this.apply(change, { indexedAfter });
  }

  private getIndex(root: string) {
    let document = this.indexes.get(root);

    if (!document) {
      document = DocumentIndex.fromValue(valueRoot(this.current, root));
      this.indexes.set(root, document);
    }

    return document;
  }

  private getSourceIndex(root: string) {
    let document = this.sourceIndexes.get(root);

    if (!document) {
      document = DocumentIndex.fromValue(valueRoot(this.source, root));
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
        DocumentIndex.fromValue(valueRoot(before, root)),
        DocumentIndex.fromValue(valueRoot(after, root))
      )
    );
  }

  return createInternalDocumentChange(
    new Map(getInternalDocumentChangeEntries(change)),
    {
      classifications,
      createRoots: change.createRoots,
      deleteRoots: change.deleteRoots,
    }
  );
};
