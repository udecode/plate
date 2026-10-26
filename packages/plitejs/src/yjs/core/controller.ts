import * as Y from 'yjs';

import {
  createInternalDocumentChange,
  filterDocumentChangeRoots,
  getInternalDocumentChangeRecords,
  getInternalDocumentChangeRootKeys as getDocumentChangeRootKeys,
  getInternalDocumentRootChange,
  valueRootIndex,
  valueRootNodes,
  withInternalDocumentRootChange,
} from '../../core/change/document-change';
import type { NodeList } from '../../core/change/document-index';
import { type EmptyTextRead, retractionOf } from '../../core/change/retraction';
import { getEditorCommitValue } from '../../core/commit';
import { getEditorSchema } from '../../core/editor-runtime';
import { holdsImportedRoot, readEmptyText } from '../../core/editor-schema';
import { isMissingReference } from '../../core/missing-reference';
import {
  getCompiledEditorSchema,
  getPluginRegistry,
} from '../../core/plugin-registry';
import { MAIN_ROOT_KEY } from '../../core/public-root';
import {
  assertEditorExternalMutationAllowed,
  getCollabEffects,
  getEditorDocumentRecords,
  registerEditorTransactionGuard,
  scheduleAfterCommitNotification,
} from '../../core/public-state';
import {
  deriveValue,
  getRecord,
  getRecordEntries,
  getValueRecords,
  type RecordOps,
  recordOpsFromJson,
} from '../../core/record-store';
import { fitImportedBlock } from '../../core/representation';
import {
  areEditorSchemaIdentitiesEqual,
  getCompiledPropertyMergeStrategy,
} from '../../core/schema-compiler';
import { createEditorEffect } from '../../core/transaction-values';
import { countCoreWork } from '../../core/work';
import type {
  Descendant,
  EditorCommit,
  EditorEffect,
  EditorSchemaIdentity,
  EditorSnapshot,
  JsonEditorValue,
} from '../../index';
import { DocumentChange, RangeApi, SelectionApi } from '../../index';
import {
  createYjsAwarenessAdapter,
  type YjsAwarenessAdapter,
} from './awareness-adapter';
import {
  countChangedTopLevelChildren,
  createRootDocumentChange,
  lowerDocumentChangeToYjs,
  reconcileYjsRoot,
} from './change-bridge';
import {
  readPliteValueFromYjs,
  removeRedundantEmptyYjsTextNodes,
  replaceYjsChildren,
  withYjsWrites,
  type YjsSetPropertyResolver,
  type YjsTextAdmission,
  type YjsWrite,
} from './document';
import {
  createYjsEditorAdapter,
  type YjsEditorAdapter,
  type YjsImportOutcome,
} from './editor-adapter';
import type { YjsEditor } from './editor-types';
import {
  type CapturedYjsEventBatch,
  captureYjsEventBatch,
  mergeYjsEventBatches,
  YjsEventChangeBridge,
  type YjsEventImportFallback,
  type YjsJoinRecovery,
} from './event-change-bridge';
import { DEFAULT_YJS_ROOT_NAME } from './keys';
import { isRecord } from './record';
import { retractYjsRoot } from './retraction';
import {
  assertYjsDocumentSchemaFormats,
  assertYjsSchemaIdentity,
  getYjsSchemaMetadataName,
  readYjsSchemaEnvelope,
  writeYjsSchemaEnvelope,
} from './schema-metadata';
import { rangeToYjsRelativeRange, yjsRelativeRangeToRange } from './selection';
import {
  type PendingYjsEffect,
  type PreparedYjsSharedEffects,
  YjsSharedEffectLog,
} from './shared-effect-log';
import type {
  YjsAwarenessChange,
  YjsAwarenessLike,
  YjsAdmissionStatus,
  YjsBaseApi,
  YjsCompactionApi,
  YjsPluginOptions,
  YjsPresenceApi,
  YjsRemoteCursorData,
  YjsTraceEntry,
} from './types';

const notifySubscribers = (subscribers: ReadonlySet<() => void>): void => {
  for (const listener of subscribers) {
    listener();
  }
};

const WAITING_FOR_LOAD = Object.freeze({
  reason: 'load',
  state: 'waiting',
}) satisfies YjsAdmissionStatus;
const WAITING_FOR_SEED = Object.freeze({
  reason: 'seed',
  state: 'waiting',
}) satisfies YjsAdmissionStatus;
// A remote change names a record that has not arrived, such as a review context
// another peer wrote; the next remote transaction retries it.
const WAITING_FOR_REFERENCE = Object.freeze({
  reason: 'reference',
  state: 'waiting',
}) satisfies YjsAdmissionStatus;
const READY = Object.freeze({ state: 'ready' }) satisfies YjsAdmissionStatus;
const EMPTY_REMOTE_CURSORS = Object.freeze([]);

const copyTraceEntries = (
  traceEntries: readonly YjsTraceEntry[]
): YjsTraceEntry[] => {
  const copy = new Array<YjsTraceEntry>(traceEntries.length);

  let index = 0;

  while (index < traceEntries.length) {
    const entry = traceEntries[index];

    if (entry === undefined) {
      throw new Error('Cannot copy a sparse Yjs trace array.');
    }

    copy[index] = entry;
    index += 1;
  }

  return copy;
};

const childrenOf = (value: JsonEditorValue, root: string) =>
  valueRootNodes(value, root) as NodeList<Descendant>;

type YjsRootBinding = {
  readonly bridge: YjsEventChangeBridge;
  readonly emptyValue: readonly Descendant[];
  readonly root: Y.XmlElement;
};

type YjsRemoteInput = Readonly<{
  effects: readonly PendingYjsEffect[];
  records: DocumentChange | null;
}>;

type YjsAdmittedImport = YjsImportOutcome &
  Readonly<{ storageMoved: () => boolean }>;

const addRecordId = (
  ids: Map<string, Set<string>>,
  set: string,
  id: string
): void => {
  const setIds = ids.get(set);

  if (setIds) setIds.add(id);
  else ids.set(set, new Set([id]));
};

const asDescendants = (
  children: JsonEditorValue['children']
): readonly Descendant[] => children as unknown as readonly Descendant[];

export class YjsController<
  TCursorData extends YjsRemoteCursorData = YjsRemoteCursorData,
> {
  private readonly awareness?: YjsAwarenessLike;
  private readonly awarenessAdapter?: YjsAwarenessAdapter<TCursorData>;
  private readonly awarenessObserver: (event: YjsAwarenessChange) => void;
  private readonly admissionSubscribers = new Set<() => void>();
  private readonly doc: Y.Doc;
  private readonly editor: YjsEditor;
  private readonly editorAdapter: YjsEditorAdapter;
  private readonly emptyValueFor: (root: string) => readonly Descendant[];
  private readonly canonicalizeOrigin = {};
  private readonly bindings = new Map<string, YjsRootBinding>();
  // One top-level map per record set, whose values are each record's
  // canonical JSON, so peers merge records by id.
  private readonly recordMaps = new Map<string, Y.Map<unknown>>();
  private readonly recordUnobservers = new Map<string, () => void>();
  private readonly isSetValued: YjsSetPropertyResolver;
  private readonly admitsText: YjsTextAdmission = (type) =>
    getEditorSchema(this.editor).getElementContent(type)?.allowsText ?? true;
  private readonly localOrigin = {};
  private readonly seedOrigin = {};
  private readonly observer: (
    events: Array<Y.YEvent<Y.AbstractType<unknown>>>,
    transaction: Y.Transaction
  ) => void;
  private readonly initialReady: true | YjsPluginOptions['initialReady'];
  private readonly rootName: string;
  private readonly root: Y.XmlElement;
  private readonly roots: Y.Map<Y.XmlElement>;
  private readonly rootsObserver: (
    events: Array<Y.YEvent<Y.AbstractType<unknown>>>,
    transaction: Y.Transaction
  ) => void;
  private readonly schemaMetadata: Y.Map<unknown>;
  private readonly schemaObserver: (
    event: Y.YMapEvent<unknown>,
    transaction: Y.Transaction
  ) => void;
  private readonly sharedEffectLog: YjsSharedEffectLog;
  private readonly sharedEffectsObserver: (
    event: Y.YArrayEvent<unknown>,
    transaction: Y.Transaction
  ) => void;
  private readonly afterTransactionObserver: (
    transaction: Y.Transaction
  ) => void;
  private readonly beforeTransactionObserver: (
    transaction: Y.Transaction
  ) => void;
  private readonly readinessObserver: () => void;
  private readonly seedGranted: boolean;
  private readonly traceEntries: YjsTraceEntry[] = [];

  private admitted = false;
  private admissionAttempting = false;
  private admissionStatusValue: YjsAdmissionStatus = WAITING_FOR_LOAD;
  private awarenessRevision = 0;
  private disposed = false;
  private initialized = false;
  private pendingRemoteEvents: CapturedYjsEventBatch | null = null;
  private pendingRemoteEffects = false;
  private readonly pendingRemoteNamedRoots = new Set<string>();
  private readonly pendingRemoteRecords = new Map<string, Set<string>>();
  private pendingRemoteRootChange = false;
  private pendingRemoteSchemaChange = false;
  private published = false;
  private readinessUnsubscribe: (() => void) | undefined;
  private readonly openRemoteTransactions = new Set<Y.Transaction>();
  private importsDone = 0;
  private importsOwed = 0;
  private readonly storageTypes = new Set<unknown>();
  private storageWrites = 0;
  private unregisterTransactionGuard: (() => void) | undefined;

  constructor(
    editor: YjsEditor,
    options: YjsPluginOptions<TCursorData>,
    context: Readonly<{
      canonicalize: YjsEditorAdapter['canonicalize'];
      emptyValueFor: (root: string) => readonly Descendant[];
    }>
  ) {
    this.editor = editor;
    this.emptyValueFor = context.emptyValueFor;
    this.editorAdapter = createYjsEditorAdapter(editor, context.canonicalize);
    this.isSetValued = (_node, key, propertyContext) => {
      const schema = getCompiledEditorSchema(this.editor);

      return (
        schema !== null &&
        getCompiledPropertyMergeStrategy(
          schema,
          propertyContext.placement,
          key,
          {
            ancestors: propertyContext.ancestors,
            root: propertyContext.root,
            type: propertyContext.type,
          }
        ) === 'set'
      );
    };
    this.doc = options.doc;
    this.initialReady = options.initialReady;
    this.rootName = options.rootName ?? DEFAULT_YJS_ROOT_NAME;
    this.seedGranted = options.seed === true;
    this.awareness = options.awareness;

    if (this.initialReady !== true && this.initialReady.doc !== this.doc) {
      throw new Error(
        'Yjs initial readiness must belong to the configured document.'
      );
    }
    if (this.awareness && this.awareness.doc !== this.doc) {
      throw new Error('Yjs awareness must belong to the configured document.');
    }

    this.root = this.doc.get(this.rootName, Y.XmlElement);
    this.roots = this.doc.getMap(`${this.rootName}:roots`);
    this.schemaMetadata = this.doc.getMap(
      getYjsSchemaMetadataName(this.rootName)
    );
    this.storageTypes.add(this.root);
    this.storageTypes.add(this.roots);
    this.storageTypes.add(this.schemaMetadata);
    this.sharedEffectLog = new YjsSharedEffectLog(
      this.doc,
      this.rootName,
      this.root,
      (key) => getPluginRegistry(editor).effectTypes.get(key)?.type,
      {
        authorityId: options.sharedEffectCompaction?.authorityId,
        editor,
        children: () => this.bindings.get('main')?.bridge.synchronized ?? [],
        captureSnapshotEffects: () => this.captureSharedSnapshotEffects(),
        onCheckpoint: () => {
          this.pendingRemoteEffects = true;
        },
        peerId: String(this.doc.clientID),
        ...(options.sharedEffectCompaction?.threshold === undefined
          ? {}
          : { threshold: options.sharedEffectCompaction.threshold }),
      }
    );
    this.awarenessObserver = (event) => {
      if (this.disposed) return;
      this.awarenessAdapter?.handleAwarenessChange(event);
      this.awarenessRevision += 1;
    };
    this.bindings.set(
      MAIN_ROOT_KEY,
      this.createRootBinding(MAIN_ROOT_KEY, this.root)
    );
    for (const [root, yRoot] of this.roots) {
      if (!(yRoot instanceof Y.XmlElement)) {
        throw new Error(`Yjs named root "${root}" must be a Y.XmlElement.`);
      }
      this.bindings.set(root, this.createRootBinding(root, yRoot));
    }
    this.bindRecordSets();
    this.awarenessAdapter = this.awareness
      ? createYjsAwarenessAdapter<TCursorData>({
          awareness: this.awareness,
          canSyncSelection: () => this.admissionStatusValue.state === 'ready',
          editor: this.editor,
          rootFor: (root) => this.rootFor(root),
          childrenFor: (root) =>
            this.bindings.get(root)?.bridge.synchronized ?? [],
          validateCursorData: (value): value is TCursorData =>
            options.cursorData?.validate(value) ?? isRecord(value),
        })
      : undefined;
    this.observer = (events, transaction) => {
      if (this.shouldIgnoreRemoteTransaction(transaction)) return;

      this.pendingRemoteEvents = mergeYjsEventBatches(
        this.pendingRemoteEvents,
        captureYjsEventBatch(events, transaction)
      );
      this.pendingRemoteRootChange = true;
    };
    this.rootsObserver = (events, transaction) => {
      if (this.shouldIgnoreRemoteTransaction(transaction)) return;

      this.pendingRemoteEvents = mergeYjsEventBatches(
        this.pendingRemoteEvents,
        captureYjsEventBatch(events, transaction)
      );

      for (const event of events) {
        if (event.target === this.roots && event instanceof Y.YMapEvent) {
          for (const root of event.keysChanged) {
            this.pendingRemoteNamedRoots.add(root);
          }
          continue;
        }

        const root = event.path[0];

        if (typeof root === 'string') {
          this.pendingRemoteNamedRoots.add(root);
        }
      }
    };
    this.sharedEffectsObserver = (event, transaction) => {
      if (
        this.shouldIgnoreRemoteTransaction(transaction) ||
        this.sharedEffectLog.isInternalTransaction(transaction)
      ) {
        return;
      }

      this.sharedEffectLog.receive(event);
      this.pendingRemoteEffects = true;
    };
    this.schemaObserver = (_event, transaction) => {
      if (this.shouldIgnoreRemoteTransaction(transaction)) return;

      this.pendingRemoteSchemaChange = true;
    };
    this.readinessObserver = () => {
      if (!this.disposed && this.published) this.processAvailableInput();
    };
    this.afterTransactionObserver = (transaction) => {
      if (
        this.openRemoteTransactions.delete(transaction) &&
        this.writesStorage(transaction)
      ) {
        this.storageWrites += 1;
      }
      if (
        this.disposed ||
        !this.published ||
        this.shouldIgnoreRemoteTransaction(transaction) ||
        this.sharedEffectLog.isInternalTransaction(transaction)
      ) {
        return;
      }

      this.processAvailableInput();
    };
    // Yjs runs the observers of a transaction that starts inside another's
    // cleanup only after that cleanup, too late for an import lowering its
    // repair, so the binding notes each remote transaction when it starts.
    this.beforeTransactionObserver = (transaction) => {
      if (
        !this.shouldIgnoreRemoteTransaction(transaction) &&
        !this.sharedEffectLog.isInternalTransaction(transaction)
      ) {
        this.openRemoteTransactions.add(transaction);
      }
    };
  }

  private writesStorage(transaction: Y.Transaction): boolean {
    for (const type of transaction.changed.keys()) {
      let top = type;

      while (top._item) top = top._item.parent as typeof top;
      if (this.storageTypes.has(top)) return true;
    }

    return false;
  }

  private createRootBinding(root: string, yRoot: Y.XmlElement): YjsRootBinding {
    const bridge = new YjsEventChangeBridge(
      yRoot,
      root,
      Object.freeze([]),
      this.isSetValued,
      {
        admitsText: this.admitsText,
        block: (node) => fitImportedBlock(this.editor, node, root),
        holds: (after, windows) =>
          holdsImportedRoot(getEditorSchema(this.editor), root, after, windows),
      }
    );

    return {
      bridge,
      emptyValue: this.emptyValueFor(root),
      root: yRoot,
    };
  }

  private rootFor(root: string): Y.XmlElement | null {
    if (root === MAIN_ROOT_KEY) return this.root;

    const yRoot = this.roots.get(root);

    return yRoot instanceof Y.XmlElement ? yRoot : null;
  }

  private recordMap(set: string): Y.Map<unknown> {
    const existing = this.recordMaps.get(set);

    if (existing) return existing;

    const map = this.doc.getMap(`${this.rootName}:records:${set}`);

    this.recordMaps.set(set, map);
    this.storageTypes.add(map);
    if (this.initialized) this.observeRecordMap(set, map);

    return map;
  }

  /**
   * Bind every record set the schema declares. A set bound after admission,
   * such as one a reconfiguration declares, raises the records its map
   * already holds.
   */
  private bindRecordSets(): void {
    for (const set of getCompiledEditorSchema(this.editor).recordSets.keys()) {
      if (this.recordMaps.has(set)) continue;

      const map = this.recordMap(set);

      if (this.admitted) {
        for (const id of map.keys()) {
          addRecordId(this.pendingRemoteRecords, set, id);
        }
      }
    }
  }

  private observeRecordMap(set: string, map: Y.Map<unknown>): void {
    if (this.recordUnobservers.has(set)) return;

    const observer = (
      event: Y.YMapEvent<unknown>,
      transaction: Y.Transaction
    ) => {
      if (this.shouldIgnoreRemoteTransaction(transaction)) return;

      for (const id of event.keysChanged) {
        addRecordId(this.pendingRemoteRecords, set, id);
      }
    };

    map.observe(observer);
    this.recordUnobservers.set(set, () => map.unobserve(observer));
  }

  private unobserveRecordMaps(): void {
    for (const unobserve of this.recordUnobservers.values()) unobserve();
    this.recordUnobservers.clear();
  }

  /** Write record puts and drops into their maps, skipping unchanged ids. */
  private lowerRecords(records: RecordOps): void {
    for (const [set, writes] of records) {
      const map = this.recordMap(set);

      for (const [id, json] of writes) {
        if (json === null) map.delete(id);
        else if (map.get(id) !== json) map.set(id, json);
      }
    }
  }

  /**
   * The record writes that bring the editor's records to the maps' values
   * for every pending id, checked as canonical record JSON.
   */
  private raiseRecords(): DocumentChange | null {
    if (this.pendingRemoteRecords.size === 0) return null;

    const store = getEditorDocumentRecords(this.editor);
    // No prototype, so an id such as "__proto__" stays an own key.
    const writes: Record<string, Record<string, unknown>> = Object.create(null);
    let changed = false;

    for (const [set, ids] of this.pendingRemoteRecords) {
      const map = this.recordMap(set);

      for (const id of ids) {
        const json = map.get(id) ?? null;

        if (json === (getRecord(store, set, id) ?? null)) continue;

        writes[set] ??= Object.create(null);
        writes[set][id] = json;
        changed = true;
      }
    }

    return changed
      ? createInternalDocumentChange(new Map(), {
          records: recordOpsFromJson(writes),
        })
      : null;
  }

  /** Mark every id the maps or the editor hold, so a raise replaces them. */
  private markAllRecordsPending(): void {
    const store = getEditorDocumentRecords(this.editor);

    for (const [set, map] of this.recordMaps) {
      for (const id of map.keys()) {
        addRecordId(this.pendingRemoteRecords, set, id);
      }
      for (const [id] of getRecordEntries(store, set)) {
        addRecordId(this.pendingRemoteRecords, set, id);
      }
    }
  }

  initializeCanonicalState(): void {
    if (this.initialized) return;

    for (const [root, binding] of this.bindings) {
      binding.bridge.reset(this.editorAdapter.readChildren(root));
    }

    this.schemaMetadata.observe(this.schemaObserver);
    this.root.observeDeep(this.observer);
    this.roots.observeDeep(this.rootsObserver);
    for (const [set, map] of this.recordMaps) this.observeRecordMap(set, map);
    this.sharedEffectLog.observe(this.sharedEffectsObserver);
    this.doc.on('afterTransaction', this.afterTransactionObserver);
    this.doc.on('beforeTransaction', this.beforeTransactionObserver);

    try {
      this.bindExternalEvents();
      this.unregisterTransactionGuard = registerEditorTransactionGuard(
        this.editor,
        ({ change, effects }) => this.assertTransactionAllowed(change, effects)
      );
      this.initialized = true;

      if (this.readInitialReady()) this.assertRoomSchemaForImport();
    } catch (error) {
      this.initialized = false;
      this.unregisterTransactionGuard?.();
      this.unregisterTransactionGuard = undefined;
      this.unbindExternalEvents();
      this.schemaMetadata.unobserve(this.schemaObserver);
      this.root.unobserveDeep(this.observer);
      this.roots.unobserveDeep(this.rootsObserver);
      this.unobserveRecordMaps();
      this.sharedEffectLog.unobserve(this.sharedEffectsObserver);
      this.doc.off('afterTransaction', this.afterTransactionObserver);
      this.doc.off('beforeTransaction', this.beforeTransactionObserver);
      throw error;
    }
  }

  destroy(): void {
    if (this.disposed) return;

    this.disposed = true;
    const errors: unknown[] = [];
    const run = (step: () => void) => {
      try {
        step();
      } catch (error) {
        errors.push(error);
      }
    };

    run(() => this.unregisterTransactionGuard?.());
    this.unregisterTransactionGuard = undefined;
    run(() => this.sharedEffectLog.destroy());
    if (this.initialized) {
      this.initialized = false;
      run(() => this.unbindExternalEvents());
      run(() => this.schemaMetadata.unobserve(this.schemaObserver));
      run(() => this.root.unobserveDeep(this.observer));
      run(() => this.roots.unobserveDeep(this.rootsObserver));
      run(() => this.unobserveRecordMaps());
      run(() => this.sharedEffectLog.unobserve(this.sharedEffectsObserver));
      run(() =>
        this.doc.off('afterTransaction', this.afterTransactionObserver)
      );
      run(() =>
        this.doc.off('beforeTransaction', this.beforeTransactionObserver)
      );
    }
    run(() => this.awarenessAdapter?.destroy());
    this.admissionSubscribers.clear();
    if (errors.length === 1) throw errors[0];
    if (errors.length > 1) {
      throw new AggregateError(errors, 'Yjs binding teardown failed.');
    }
  }

  cursorCache(view: YjsEditor = this.editor): YjsAwarenessAdapter<TCursorData> {
    const adapter = this.awarenessAdapter;

    if (!adapter) {
      throw new Error('Yjs awareness is not configured for this binding.');
    }

    return adapter.forView(view);
  }

  private bindExternalEvents(): void {
    this.awareness?.on('change', this.awarenessObserver);
    if (this.initialReady !== true) {
      const unsubscribe = this.initialReady.subscribe(this.readinessObserver);
      let active = true;

      this.readinessUnsubscribe = () => {
        if (!active) return;

        active = false;
        unsubscribe();
      };
    }
  }

  private unbindExternalEvents(): void {
    const unsubscribe = this.readinessUnsubscribe;

    this.readinessUnsubscribe = undefined;
    try {
      unsubscribe?.();
    } finally {
      this.awareness?.off('change', this.awarenessObserver);
    }
  }

  matches(doc: Y.Doc, rootName: string): boolean {
    return this.doc === doc && this.rootName === rootName;
  }

  start(): void {
    this.assertActive();
    if (this.published) return;

    this.published = true;
    this.processAvailableInput();
  }

  handleCommit(commit: EditorCommit, _snapshot: EditorSnapshot): void {
    if (
      this.admissionStatusValue.state === 'error' &&
      commit.dirtyStateKeys.includes('$configuration')
    ) {
      scheduleAfterCommitNotification(this.editor, () => {
        this.pendingRemoteEffects = true;
        this.processAvailableInput();
      });
    }

    const cursorCache = this.awarenessAdapter?.forView(this.editor);
    const sharedEffects = getCollabEffects(this.editor, commit);
    const shouldSyncSelection =
      cursorCache !== undefined && commit.selectionChanged;

    if (this.admissionStatusValue.state !== 'ready') {
      if (shouldSyncSelection) cursorCache.claimSelection();

      return;
    }

    if (
      this.shouldSkipCommit(
        commit,
        sharedEffects.length > 0,
        shouldSyncSelection
      )
    ) {
      return;
    }

    const after = getEditorCommitValue(commit);
    const before = getEditorCommitValue(commit, 'before');
    const changedRoots = new Set<string>();
    const records = getInternalDocumentChangeRecords(commit.changes);
    const rootKeys = getDocumentChangeRootKeys(commit.changes);

    if (
      rootKeys.length > 0 ||
      commit.changes.createRoots.size > 0 ||
      commit.changes.deleteRoots.size > 0
    ) {
      for (const root of rootKeys) {
        changedRoots.add(root);
      }
      for (const root of commit.changes.createRoots) {
        changedRoots.add(root);
      }
      for (const root of commit.changes.deleteRoots) {
        changedRoots.add(root);
      }
      for (const root of new Set([
        ...Object.keys(before.roots ?? {}),
        ...Object.keys(after.roots ?? {}),
      ])) {
        if (
          Object.hasOwn(before.roots ?? {}, root) !==
          Object.hasOwn(after.roots ?? {}, root)
        ) {
          changedRoots.add(root);
        }
      }
    }
    const documentChanged = changedRoots.size > 0;

    if (!documentChanged && records.size === 0 && sharedEffects.length === 0) {
      if (shouldSyncSelection) cursorCache.syncSelection();

      return;
    }
    const preparedSharedEffects = this.sharedEffectLog.prepare(sharedEffects);

    if (!documentChanged) {
      this.transact(() => {
        this.lowerRecords(records);
        this.appendSharedEffects(preparedSharedEffects);
      }, this.localOrigin);
      this.sharedEffectLog.settle();

      if (shouldSyncSelection) cursorCache.syncSelection();

      return;
    }

    const removedBindings: string[] = [];
    const fallbacks = new Set<string>([
      ...commit.changes.createRoots,
      ...commit.changes.deleteRoots,
    ]);

    this.transact((writeOf) => {
      this.lowerRecords(records);
      for (const root of changedRoots) {
        if (commit.changes.deleteRoots.has(root)) {
          this.roots.delete(root);
          removedBindings.push(root);
          this.traceEntries.push({
            changedChildren: (before.roots?.[root] ?? []).length,
            mode: 'canonical-change',
            root,
          });
          continue;
        }

        const expected = childrenOf(after, root);
        let binding = this.bindings.get(root);

        if (!binding) {
          const yRoot = new Y.XmlElement();
          const children = expected.slice();

          this.roots.set(root, yRoot);
          binding = this.createRootBinding(root, yRoot);
          this.bindings.set(root, binding);
          replaceYjsChildren(
            writeOf(binding.root),
            binding.root,
            children,
            this.isSetValued,
            {
              ancestors: [],
              path: [],
              root,
            }
          );
          binding.bridge.reset(expected);
          this.traceEntries.push({
            changedChildren: children.length,
            mode: 'canonical-change',
            root,
          });
          continue;
        }

        const publicRoot = root === MAIN_ROOT_KEY ? undefined : root;
        const structureChanged =
          root === MAIN_ROOT_KEY
            ? commit.changed.has('structure')
            : commit.changed.has('structure', publicRoot);
        const rootChange =
          changedRoots.size === 1
            ? commit.changes
            : filterDocumentChangeRoots(
                commit.changes,
                (changed) => changed === root
              );
        const readIndexes = () => ({
          after: valueRootIndex(after, root),
          before: valueRootIndex(before, root),
        });
        let indexes: ReturnType<typeof readIndexes> | undefined;
        const write = writeOf(binding.root);
        const incremental = binding.bridge.lower(write, rootChange, expected, {
          // Several of the bridge's detectors read them, and a root other
          // than the main one builds them anew on each read.
          indexes: () => (indexes ??= readIndexes()),
          structureChanged,
        });
        const result =
          incremental.kind === 'lowered'
            ? incremental
            : binding.bridge.rewrite(write, () =>
                lowerDocumentChangeToYjs({
                  admitsText: this.admitsText,
                  base: childrenOf(before, root).slice(),
                  canonicalize: (children) =>
                    this.canonicalizeRootInDocument(root, children, before),
                  change: rootChange,
                  emptyValue: binding.emptyValue,
                  expected: expected.slice(),
                  isSetValued: this.isSetValued,
                  knownYjsValue: binding.bridge.synchronized.slice(),
                  root,
                  write,
                })
              );

        if (incremental.kind === 'fallback') {
          countCoreWork('fallbacks');
          fallbacks.add(root);
        }

        this.traceEntries.push({
          canonicalStrategy: result.strategy,
          changedChildren: result.inserted + result.removed,
          ...(incremental.kind === 'lowered'
            ? { changedRanges: incremental.changedRanges }
            : {}),
          ...(incremental.kind === 'lowered'
            ? { tokenLengthNodes: incremental.tokenLengthNodes }
            : {}),
          ...(incremental.kind === 'fallback'
            ? {
                fallback:
                  incremental.fallback === 'remote-event-projected-content'
                    ? ('canonical-change-projected-content' as const)
                    : ('canonical-change-mirror-mismatch' as const),
              }
            : {}),
          mode: 'canonical-change',
          ...(root === MAIN_ROOT_KEY ? {} : { root }),
        });
      }
      this.appendSharedEffects(preparedSharedEffects);
    }, this.localOrigin);
    this.sharedEffectLog.settle();

    for (const root of removedBindings) {
      this.bindings.delete(root);
    }
    for (const root of changedRoots) {
      const binding = this.bindings.get(root);

      if (!binding) continue;

      if (fallbacks.has(root)) {
        binding.bridge.reset(childrenOf(after, root));
      }
    }
    this.awarenessAdapter?.publishMappedRoots(changedRoots, {
      fallbackRoots: fallbacks,
    });
    if (shouldSyncSelection) cursorCache.syncSelection();
    for (const root of changedRoots) {
      const binding = this.bindings.get(root);
      const drift = binding?.bridge.drift(
        childrenOf(after, root),
        fallbacks.has(root)
      );

      if (!binding || !drift) continue;

      const selection = this.editor.read.selection();
      const relative =
        RangeApi.isRange(selection) &&
        (SelectionApi.root(selection) ?? 'main') === root
          ? rangeToYjsRelativeRange(
              binding.root,
              selection,
              childrenOf(after, root)
            )
          : null;
      const mapped = relative
        ? yjsRelativeRangeToRange(
            binding.root,
            relative,
            childrenOf(drift.change.apply(after), root)
          )
        : null;

      scheduleAfterCommitNotification(this.editor, () => {
        const outcome = this.admitRemote({
          change: drift.change,
          effects: [],
          ...(mapped
            ? {
                selection: SelectionApi.text({
                  ...mapped,
                  ...(root === 'main' ? {} : { root }),
                }),
              }
            : {}),
        });

        drift.accept(valueRootIndex(this.editorAdapter.readValue(), root));
        this.lowerAdmissionRepair(outcome);
        this.awarenessAdapter?.publishMappedRoots(new Set([root]));
      });
    }
  }

  assertSchemaIdentity(next: EditorSchemaIdentity): void {
    const current = this.localSchemaIdentity();

    if (areEditorSchemaIdentitiesEqual(current, next)) {
      return;
    }

    const envelope = readYjsSchemaEnvelope(this.schemaMetadata);

    if (envelope === null) {
      if (this.root.length > 0) {
        throw new Error(
          'Cannot reconfigure the editor schema because the Yjs document has content without schema metadata.'
        );
      }

      return;
    }
    assertYjsSchemaIdentity(next, envelope.identity);
  }

  private readInitialReady(): boolean {
    return this.initialReady === true || this.initialReady.getSnapshot();
  }

  private setAdmissionStatus(status: YjsAdmissionStatus): void {
    if (this.admissionStatusValue === status) return;

    this.admissionStatusValue = status;
    notifySubscribers(this.admissionSubscribers);
  }

  private setAdmissionError(cause: unknown): void {
    if (
      this.admissionStatusValue.state === 'error' &&
      this.admissionStatusValue.cause === cause
    ) {
      return;
    }

    this.setAdmissionStatus(Object.freeze({ cause, state: 'error' }));
  }

  private publishReady(): void {
    const previous = this.admissionStatusValue;

    this.admissionStatusValue = READY;
    try {
      this.awarenessAdapter?.syncSelection();
    } catch (error) {
      this.admissionStatusValue = previous;
      throw error;
    }

    if (previous !== READY) notifySubscribers(this.admissionSubscribers);
  }

  private clearPendingInput(): void {
    this.pendingRemoteEvents = null;
    this.pendingRemoteRootChange = false;
    this.pendingRemoteNamedRoots.clear();
    this.pendingRemoteRecords.clear();
    this.pendingRemoteEffects = false;
    this.pendingRemoteSchemaChange = false;
  }

  private processAvailableInput(): void {
    if (this.disposed || this.admissionAttempting) return;

    this.admissionAttempting = true;
    try {
      this.bindRecordSets();
      if (!this.admitted) {
        if (!this.readInitialReady()) {
          this.setAdmissionStatus(WAITING_FOR_LOAD);

          return;
        }

        const claimed = this.assertRoomSchemaForImport();

        if (!claimed && !this.seedGranted) {
          this.setAdmissionStatus(WAITING_FOR_SEED);

          return;
        }

        const pending = this.sharedEffectLog.pending();

        if (claimed) {
          this.markAllRecordsPending();
          this.importDocumentFromYjs('seed', {
            effects: pending.effects,
            records: this.raiseRecords(),
          });
        } else {
          this.seedInitialValue();
          if (pending.effects.length > 0) {
            this.lowerAdmissionRepair(
              this.admitRemote({ effects: pending.effects })
            );
          }
        }

        this.sharedEffectLog.activate();
        this.sharedEffectLog.acknowledge(pending.eventIds);
        this.clearPendingInput();
        this.admitted = true;
      } else {
        this.assertRoomSchemaForImport();
        this.flushRemoteTransaction();
      }
      while (this.importsDone !== this.importsOwed) {
        const owed = this.importsOwed;

        this.assertRoomSchemaForImport();
        this.markAllRecordsPending();

        const pending = this.sharedEffectLog.pending();

        this.importDocumentFromYjs('remote-reconcile', {
          effects: pending.effects,
          records: this.raiseRecords(),
        });
        this.sharedEffectLog.acknowledge(pending.eventIds);
        this.clearPendingInput();
        this.importsDone = owed;
      }

      this.sharedEffectLog.settle();
      this.publishReady();
    } catch (error) {
      if (isMissingReference(error)) {
        this.setAdmissionStatus(WAITING_FOR_REFERENCE);
      } else {
        this.setAdmissionError(error);
      }
    } finally {
      this.admissionAttempting = false;
    }
  }

  private admitRemote(
    input: Parameters<YjsEditorAdapter['applyRemote']>[0]
  ): YjsAdmittedImport {
    const writes = this.storageWrites;
    const open = new Set(this.openRemoteTransactions);

    return {
      ...this.editorAdapter.applyRemote(input),
      storageMoved: () =>
        writes !== this.storageWrites ||
        [...this.openRemoteTransactions].some(
          (transaction) =>
            !open.has(transaction) && this.writesStorage(transaction)
        ),
    };
  }

  private importAgain(): void {
    this.importsOwed += 1;
    if (!this.admissionAttempting) this.processAvailableInput();
  }

  /**
   * Each admitting peer computes the same repair of one import and writes it,
   * so only deletions and in-place writes merge into one copy.
   */
  private lowerAdmissionRepair({
    admission,
    deletedRoots,
    storageMoved,
  }: YjsAdmittedImport): void {
    const repair = admission?.repair;
    const deleted = new Set(
      [...deletedRoots, ...(repair?.deleteRoots ?? [])].filter((root) =>
        this.roots.has(root)
      )
    );

    if (!repair && deleted.size === 0) return;
    if (storageMoved()) {
      this.importAgain();

      return;
    }

    const store = getEditorDocumentRecords(this.editor);
    const records: RecordOps = new Map(
      [...(repair ? getInternalDocumentChangeRecords(repair) : [])].map(
        ([set, writes]) => [
          set,
          new Map(
            [...writes.keys()].map((id) => [
              id,
              getRecord(store, set, id) ?? null,
            ])
          ),
        ]
      )
    );
    const repaired = admission
      ? getDocumentChangeRootKeys(admission.repair).flatMap((root) => {
          if (admission.repair.deleteRoots.has(root)) return [];

          const binding = this.bindings.get(root);

          if (!binding) {
            throw new Error(`Yjs root binding "${root}" is unavailable.`);
          }

          return [
            {
              base: valueRootIndex(admission.base, root),
              binding,
              change: getInternalDocumentRootChange(admission.repair, root),
              children: this.editorAdapter.readChildren(root),
              root,
            },
          ];
        })
      : [];

    this.transact((writeOf) => {
      this.lowerRecords(records);
      for (const root of deleted) this.roots.delete(root);
      for (const { base, binding, change, children, root } of repaired) {
        const write = writeOf(binding.root);
        const schemaRoot = root === MAIN_ROOT_KEY ? null : root;
        const readEmpty: EmptyTextRead = (ancestors) =>
          readEmptyText(
            getCompiledEditorSchema(this.editor),
            ancestors,
            schemaRoot ?? undefined
          );
        const retraction = change && retractionOf(base, change, readEmpty);
        const retracted =
          !!retraction &&
          binding.bridge.rewrite(write, () =>
            retractYjsRoot(
              write,
              base,
              children,
              retraction,
              this.isSetValued,
              schemaRoot,
              readEmpty,
              (block) => fitImportedBlock(this.editor, block, root)
            )
          );

        if (!retracted) {
          binding.bridge.rewrite(write, () =>
            reconcileYjsRoot(
              write,
              this.readYjsRootValue(binding),
              children,
              this.isSetValued,
              schemaRoot
            )
          );
        }
        this.traceEntries.push({
          mode: 'admission-repair',
          ...(root === MAIN_ROOT_KEY ? {} : { root }),
          strategy: retracted ? 'retraction' : 'rewrite',
        });
      }
    }, this.canonicalizeOrigin);
    for (const root of deleted) this.bindings.delete(root);
    for (const { binding, children } of repaired) {
      binding.bridge.reset(children);
    }

    const mapped = new Set([...repaired.map(({ root }) => root), ...deleted]);

    if (mapped.size > 0) {
      this.awarenessAdapter?.publishMappedRoots(mapped, {
        fallbackRoots: mapped,
      });
    }
  }

  private assertRoomSchemaForImport(): boolean {
    assertYjsDocumentSchemaFormats(this.doc);

    const envelope = readYjsSchemaEnvelope(this.schemaMetadata);

    if (envelope === null) {
      if (
        this.root.length === 0 &&
        this.roots.size === 0 &&
        [...this.recordMaps.values()].every((map) => map.size === 0) &&
        this.sharedEffectLog.empty()
      ) {
        return false;
      }

      throw new Error(
        'Cannot import a nonempty Yjs document without schema metadata.'
      );
    }

    assertYjsSchemaIdentity(this.localSchemaIdentity(), envelope.identity);

    return true;
  }

  private appendSharedEffects(effects: PreparedYjsSharedEffects): void {
    this.sharedEffectLog.append(effects);
  }

  private localSchemaIdentity(): EditorSchemaIdentity {
    return this.editor.read.schema.identity();
  }

  private captureSharedSnapshotEffects(): readonly EditorEffect[] {
    return this.editor.read((state) => {
      const effects: EditorEffect[] = [];

      for (const { type } of getPluginRegistry(
        this.editor
      ).effectTypes.values()) {
        if (type.collab !== 'shared' || type.collabReplay !== 'latest') {
          continue;
        }

        const value = type.collabSnapshot?.(state);

        if (value !== undefined) {
          effects.push(createEditorEffect(type, value));
        }
      }

      return Object.freeze(effects);
    });
  }

  private shouldIgnoreRemoteTransaction(transaction: Y.Transaction): boolean {
    return (
      transaction.origin === this.localOrigin ||
      transaction.origin === this.canonicalizeOrigin ||
      transaction.origin === this.seedOrigin
    );
  }

  private flushRemoteTransaction(): void {
    if (
      !this.pendingRemoteRootChange &&
      this.pendingRemoteNamedRoots.size === 0 &&
      this.pendingRemoteRecords.size === 0 &&
      !this.pendingRemoteEffects &&
      !this.pendingRemoteSchemaChange
    ) {
      return;
    }

    const rootChanged = this.pendingRemoteRootChange;
    const namedRoots = new Set(this.pendingRemoteNamedRoots);
    const events = this.pendingRemoteEvents;
    const pending = this.sharedEffectLog.pending();
    // Records apply before content in one commit, so a run and the context
    // it names in one Yjs transaction never wait for each other.
    const remote: YjsRemoteInput = {
      effects: pending.effects,
      records: this.raiseRecords(),
    };

    if (!rootChanged && namedRoots.size === 1 && events !== null) {
      this.importYjsEvents(events, remote, [...namedRoots][0]);
    } else if (namedRoots.size > 0) {
      this.importDocumentFromYjs(
        'remote-reconcile',
        remote,
        { main: rootChanged, named: namedRoots },
        events
      );
    } else if (rootChanged) {
      if (events === null) {
        this.importFromYjs(MAIN_ROOT_KEY, 'remote-reconcile', remote);
      } else {
        this.importYjsEvents(events, remote);
      }
    } else if (remote.effects.length > 0 || remote.records) {
      this.lowerAdmissionRepair(this.admitRemote(remote));
    }
    this.sharedEffectLog.acknowledge(pending.eventIds);
    this.clearPendingInput();
  }

  private shouldSkipCommit(
    commit: EditorCommit,
    hasSharedEffects: boolean,
    shouldSyncSelection: boolean
  ): boolean {
    return (
      this.editorAdapter.importing() ||
      (!commit.changed.hasAny('document') &&
        !hasSharedEffects &&
        !shouldSyncSelection) ||
      commit.tags.includes('skip-collab') ||
      commit.tags.includes('collaboration')
    );
  }

  baseApi(): YjsBaseApi {
    return Object.freeze({
      admissionStatus: () => {
        this.assertActive();

        return this.admissionStatusValue;
      },
      retryImport: () => {
        this.assertExternalMutationAllowed();
        if (this.admissionStatusValue.state !== 'error') return;

        this.processAvailableInput();
        if (this.admissionStatusValue.state === 'error') {
          throw this.admissionStatusValue.cause;
        }
      },
      subscribeAdmissionStatus: (listener) =>
        this.subscribeAdmissionStatus(listener),
    });
  }

  presenceApi(view: YjsEditor): YjsPresenceApi<TCursorData> {
    const adapter = this.cursorCache(view);

    return Object.freeze({
      clearSelection: () => {
        this.assertExternalMutationAllowed();
        adapter.clearSelection();
      },
      remoteCursor: (clientId) => {
        this.assertActive();

        return this.admissionStatusValue.state === 'ready'
          ? adapter.remoteCursor(clientId)
          : null;
      },
      remoteCursors: () => {
        this.assertActive();

        return this.admissionStatusValue.state === 'ready'
          ? adapter.remoteCursors()
          : EMPTY_REMOTE_CURSORS;
      },
      setCursorData: (data) => {
        this.assertExternalMutationAllowed();
        adapter.setCursorData(data);
      },
      subscribeRemoteCursors: (listener) => {
        this.assertActive();
        const unsubscribeCursors = adapter.subscribeCursors(listener);
        const unsubscribeAdmission = this.subscribeAdmissionStatus(listener);
        let active = true;

        return () => {
          if (!active) return;

          active = false;
          unsubscribeCursors();
          unsubscribeAdmission();
        };
      },
      syncSelection: () => {
        this.assertExternalMutationAllowed();
        if (this.admissionStatusValue.state !== 'ready') {
          throw new Error('Cannot publish a Yjs selection before admission.');
        }
        adapter.syncSelection();
      },
    });
  }

  compactionApi(): YjsCompactionApi {
    return Object.freeze({
      retireSharedEffectPeer: (clientId) => {
        this.assertExternalMutationAllowed();
        if (!Number.isSafeInteger(clientId) || clientId < 0) {
          throw new Error('A Yjs peer ID must be a non-negative client ID.');
        }
        this.sharedEffectLog.retirePeer(String(clientId));
      },
    });
  }

  private assertActive(): void {
    if (this.disposed) {
      throw new Error('Yjs binding is no longer active.');
    }
  }

  private assertExternalMutationAllowed(): void {
    this.assertActive();
    assertEditorExternalMutationAllowed(this.editor);
  }

  private assertTransactionAllowed(
    change: DocumentChange,
    effects: readonly EditorEffect[]
  ): void {
    if (
      this.editorAdapter.importing() ||
      this.admissionStatusValue.state === 'ready' ||
      (change.empty &&
        effects.every((effect) => effect.type.collab !== 'shared'))
    ) {
      return;
    }

    const detail =
      this.admissionStatusValue.state === 'error'
        ? 'the binding has an admission error'
        : `the binding is waiting for ${this.admissionStatusValue.reason}`;

    throw new Error(
      `Cannot publish collaborative editor work while ${detail}.`
    );
  }

  private subscribeAdmissionStatus(listener: () => void): () => void {
    this.assertActive();
    this.admissionSubscribers.add(listener);
    let active = true;

    return () => {
      if (!active) return;

      active = false;
      this.admissionSubscribers.delete(listener);
    };
  }

  debugRoot(): Y.XmlElement {
    return this.root;
  }

  debugTrace(): readonly YjsTraceEntry[] {
    return copyTraceEntries(this.traceEntries);
  }

  clearDebugTrace(): void {
    this.traceEntries.length = 0;
  }

  debugAwarenessRevision(): number {
    return this.awarenessRevision;
  }

  debugProcessAvailableInput(): void {
    this.processAvailableInput();
  }

  private currentSelection() {
    return (
      this.awarenessAdapter?.currentSelection() ?? this.editor.read.selection()
    );
  }

  private transact<T>(
    run: (writeOf: (root: Y.XmlElement) => YjsWrite) => T,
    origin: unknown
  ): T {
    return this.doc.transact(() => withYjsWrites(run), origin);
  }

  private seedInitialValue(): void {
    this.seedValue(this.editorAdapter.readValue());
  }

  private seedValue(value: JsonEditorValue): void {
    const snapshots = this.sharedEffectLog.prepare(
      this.captureSharedSnapshotEffects()
    );
    this.transact((writeOf) => {
      const envelope = readYjsSchemaEnvelope(this.schemaMetadata);
      const identity = this.localSchemaIdentity();

      if (envelope === null) {
        writeYjsSchemaEnvelope(this.schemaMetadata, identity);
      } else {
        assertYjsSchemaIdentity(identity, envelope.identity);
      }

      replaceYjsChildren(
        writeOf(this.root),
        this.root,
        asDescendants(value.children),
        this.isSetValued,
        {
          ancestors: [],
          path: [],
          root: null,
        }
      );
      this.roots.clear();
      for (const [root, children] of Object.entries(value.roots ?? {})) {
        const yRoot = new Y.XmlElement();

        this.roots.set(root, yRoot);
        replaceYjsChildren(
          writeOf(yRoot),
          yRoot,
          asDescendants(children),
          this.isSetValued,
          {
            ancestors: [],
            path: [],
            root,
          }
        );
      }

      const records = getValueRecords(value);

      for (const map of this.recordMaps.values()) map.clear();
      for (const set of Object.keys(records)) {
        const map = this.recordMap(set);

        for (const [id, json] of getRecordEntries(records, set)) {
          map.set(id, json);
        }
      }
      this.appendSharedEffects(snapshots);
    }, this.seedOrigin);
    this.resetBindingsFromYjs();
    this.traceEntries.push({ mode: 'seed' });
  }

  /** Reconciles the whole of `root` with its Yjs root. */
  private importFromYjs(
    root: string,
    mode: YjsTraceEntry['mode'],
    remote: YjsRemoteInput,
    recover: YjsJoinRecovery | null = null,
    trace: {
      fallback?: YjsEventImportFallback;
      importKind?: YjsTraceEntry['importKind'];
    } = {}
  ): void {
    countCoreWork('reconciles');
    if (trace.fallback) countCoreWork('fallbacks');

    const binding = this.bindings.get(root);

    if (!binding) {
      throw new Error(`Yjs root binding "${root}" is unavailable.`);
    }

    this.transact((writeOf) => {
      removeRedundantEmptyYjsTextNodes(writeOf(binding.root));
    }, this.canonicalizeOrigin);

    const before = this.editorAdapter.readChildren(root);
    const children = this.editorAdapter.canonicalize(
      root,
      this.readYjsRootValue(binding)
    );
    const joined = recover?.(before, children) ?? null;
    const change = joined
      ? createInternalDocumentChange(new Map([[root, joined]]))
      : createRootDocumentChange(root, before, children, this.isSetValued);

    this.traceEntries.push({
      changedChildren: countChangedTopLevelChildren(before, children),
      ...(trace.fallback ? { fallback: trace.fallback } : {}),
      importKind: trace.importKind ?? 'snapshot-change',
      mode,
      ...(root === MAIN_ROOT_KEY ? {} : { root }),
    });
    const outcome = this.admitRemote({
      ...remote,
      change,
      selection: this.currentSelection(),
    });

    binding.bridge.reset(children);
    binding.bridge.refreshMasks(children);
    this.lowerAdmissionRepair(outcome);
    const changedRoots = new Set([root]);

    this.awarenessAdapter?.publishMappedRoots(changedRoots, {
      fallbackRoots: changedRoots,
    });
  }

  private importDocumentFromYjs(
    mode: YjsTraceEntry['mode'],
    remote: YjsRemoteInput,
    changed?: Readonly<{
      main: boolean;
      named: ReadonlySet<string>;
    }>,
    events: CapturedYjsEventBatch | null = null
  ): void {
    const namedRoots =
      changed?.named ??
      new Set([
        ...Object.keys(this.editorAdapter.readValue().roots ?? {}),
        ...this.roots.keys(),
      ]);
    const recoveries = new Map<string, YjsJoinRecovery>();

    if (events) {
      for (const root of [
        ...((changed?.main ?? true) ? [MAIN_ROOT_KEY] : []),
        ...namedRoots,
      ]) {
        const recover = this.bindings.get(root)?.bridge.joinRecovery(events);

        if (recover) recoveries.set(root, recover);
      }
    }

    this.transact((writeOf) => {
      if (changed?.main ?? true) {
        removeRedundantEmptyYjsTextNodes(writeOf(this.root));
      }
      for (const root of namedRoots) {
        const yRoot = this.roots.get(root);

        if (yRoot === undefined) continue;
        if (!(yRoot instanceof Y.XmlElement)) {
          throw new Error('A Yjs named root must be a Y.XmlElement.');
        }
        removeRedundantEmptyYjsTextNodes(writeOf(yRoot));
      }
    }, this.canonicalizeOrigin);

    const before = this.editorAdapter.readValue();
    const next = this.readYjsDocumentValue(before, {
      main: changed?.main ?? true,
      named: namedRoots,
    });
    let change = DocumentChange.between(before, next);

    for (const [root, recover] of recoveries) {
      if (
        Object.hasOwn(before.roots ?? {}, root) !==
        Object.hasOwn(next.roots ?? {}, root)
      ) {
        continue;
      }

      const joined = recover(
        asDescendants(
          root === MAIN_ROOT_KEY
            ? before.children
            : (before.roots?.[root] ?? [])
        ),
        asDescendants(
          root === MAIN_ROOT_KEY ? next.children : (next.roots?.[root] ?? [])
        )
      );

      if (joined) change = withInternalDocumentRootChange(change, root, joined);
    }

    const roots = new Set([
      ...((changed?.main ?? true) ? [MAIN_ROOT_KEY] : []),
      ...namedRoots,
    ]);

    for (const root of roots) {
      const beforeChildren =
        root === MAIN_ROOT_KEY ? before.children : (before.roots?.[root] ?? []);
      const afterChildren =
        root === MAIN_ROOT_KEY ? next.children : (next.roots?.[root] ?? []);
      const changedChildren = countChangedTopLevelChildren(
        asDescendants(beforeChildren),
        asDescendants(afterChildren)
      );

      if (
        changedChildren === 0 &&
        Object.hasOwn(before.roots ?? {}, root) ===
          Object.hasOwn(next.roots ?? {}, root)
      ) {
        continue;
      }

      this.traceEntries.push({
        changedChildren,
        importKind: 'snapshot-change',
        mode,
        ...(root === MAIN_ROOT_KEY ? {} : { root }),
      });
    }

    const outcome = this.admitRemote({
      ...remote,
      change,
      selection: this.currentSelection(),
    });

    this.resetBindingsFromYjs({
      main: changed?.main ?? true,
      named: namedRoots,
    });
    this.lowerAdmissionRepair(outcome);
    this.awarenessAdapter?.publishMappedRoots(roots, {
      fallbackRoots: roots,
    });
  }

  private readYjsDocumentValue(
    before: JsonEditorValue,
    changed: Readonly<{
      main: boolean;
      named: ReadonlySet<string>;
    }>
  ): JsonEditorValue {
    const primary = this.bindings.get(MAIN_ROOT_KEY);

    if (!primary) {
      throw new Error('Yjs primary root binding is unavailable.');
    }

    const roots: Record<string, JsonEditorValue['children']> = {
      ...before.roots,
    };

    for (const root of changed.named) {
      const yRoot = this.roots.get(root);

      if (yRoot === undefined) {
        delete roots[root];
        continue;
      }
      if (!(yRoot instanceof Y.XmlElement)) {
        throw new Error(`Yjs named root "${root}" must be a Y.XmlElement.`);
      }
      let binding = this.bindings.get(root);

      if (!binding || binding.root !== yRoot) {
        binding = this.createRootBinding(root, yRoot);
        this.bindings.set(root, binding);
      }
      roots[root] = this.readYjsRootValue(binding);
    }

    return this.editorAdapter.canonicalizeDocument({
      children: changed.main ? this.readYjsRootValue(primary) : before.children,
      ...(before.meta === undefined ? {} : { meta: before.meta }),
      ...(Object.keys(roots).length === 0 ? {} : { roots }),
    });
  }

  private readYjsRootValue(binding: YjsRootBinding): readonly Descendant[] {
    return readPliteValueFromYjs(
      binding.root,
      binding.emptyValue,
      this.admitsText
    );
  }

  private canonicalizeRootInDocument(
    root: string,
    children: readonly Descendant[],
    document: JsonEditorValue
  ): readonly Descendant[] {
    const value = this.editorAdapter.canonicalizeDocument(
      deriveValue(
        document,
        root === MAIN_ROOT_KEY
          ? { children }
          : { roots: { ...document.roots, [root]: children } }
      )
    );

    return root === MAIN_ROOT_KEY
      ? asDescendants(value.children)
      : asDescendants(value.roots?.[root] ?? []);
  }

  private resetBindingsFromYjs(
    changed?: Readonly<{
      main: boolean;
      named: ReadonlySet<string>;
    }>
  ): void {
    const primary = this.bindings.get(MAIN_ROOT_KEY);

    if (!primary) {
      throw new Error('Yjs primary root binding is unavailable.');
    }
    if (changed?.main ?? true) {
      primary.bridge.reset(this.editorAdapter.readChildren(MAIN_ROOT_KEY));
      primary.bridge.refreshMasks(
        this.editorAdapter.readChildren(MAIN_ROOT_KEY)
      );
    }

    const namedRoots = changed?.named ?? new Set(this.roots.keys());

    for (const root of namedRoots) {
      const yRoot = this.roots.get(root);

      if (yRoot === undefined) {
        this.bindings.delete(root);
        continue;
      }
      if (!(yRoot instanceof Y.XmlElement)) {
        throw new Error(`Yjs named root "${root}" must be a Y.XmlElement.`);
      }
      let binding = this.bindings.get(root);

      if (!binding || binding.root !== yRoot) {
        binding = this.createRootBinding(root, yRoot);
        this.bindings.set(root, binding);
      }
      binding.bridge.reset(this.editorAdapter.readChildren(root));
      binding.bridge.refreshMasks(this.editorAdapter.readChildren(root));
    }

    if (!changed) {
      for (const root of this.bindings.keys()) {
        if (root !== MAIN_ROOT_KEY && !this.roots.has(root)) {
          this.bindings.delete(root);
        }
      }
    }
  }

  private importYjsEvents(
    events: CapturedYjsEventBatch,
    remote: YjsRemoteInput,
    root = MAIN_ROOT_KEY
  ): void {
    const binding = this.bindings.get(root);

    if (!binding) {
      throw new Error(`Yjs root binding "${root}" is unavailable.`);
    }
    const result = this.transact(
      (writeOf) => binding.bridge.prepareRemote(writeOf(binding.root), events),
      this.canonicalizeOrigin
    );

    if (result.kind === 'fallback') {
      this.importFromYjs(root, 'remote-reconcile', remote, result.recover, {
        fallback: result.fallback,
        importKind: 'full-diff-fallback',
      });

      return;
    }

    this.traceEntries.push({
      changedChildren: result.import.changedChildren,
      changedRanges: result.import.changedRanges,
      importKind: 'event-change',
      mode: 'remote-reconcile',
      readTopLevelNodes: result.import.readTopLevelNodes,
      ...(root === MAIN_ROOT_KEY ? {} : { root }),
    });
    const outcome = this.admitRemote({
      ...remote,
      change: result.import.change,
      selection: this.currentSelection(),
    });

    result.import.accept(valueRootIndex(this.editorAdapter.readValue(), root));
    this.lowerAdmissionRepair(outcome);
    this.awarenessAdapter?.publishMappedRoots(new Set([root]));
  }
}
