import * as Y from 'yjs';

import {
  getAuthoredCommitView,
  getAuthoredProjectedChange,
  getAuthoredViewCommit,
  readAuthoredView,
} from '../../core/authored-runtime';
import { getInternalDocumentChangeRootKeys as getDocumentChangeRootKeys } from '../../core/change/document-change';
import {
  getCompiledEditorSchema,
  getPluginRegistry,
} from '../../core/plugin-registry';
import {
  assertEditorExternalMutationAllowed,
  getCollabEffects,
  registerEditorTransactionGuard,
  scheduleAfterCommitNotification,
} from '../../core/public-state';
import { getCompiledPropertyMergeStrategy } from '../../core/schema-compiler';
import { createEditorEffect } from '../../core/transaction-values';
import type {
  Descendant,
  EditorCommit,
  EditorEffect,
  EditorSchemaIdentity,
  EditorSnapshot,
  JsonEditorValue,
} from '../../index';
import {
  areEditorSchemaIdentitiesEqual,
  DocumentChange,
  MAIN_ROOT_KEY,
} from '../../index';
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
  type YjsSetPropertyResolver,
} from './document';
import {
  createYjsEditorAdapter,
  type YjsEditorAdapter,
} from './editor-adapter';
import type { YjsEditor } from './editor-types';
import {
  type CapturedYjsEventBatch,
  captureYjsEventBatch,
  mergeYjsEventBatches,
  YjsEventChangeBridge,
  type YjsEventImportFallback,
  type YjsEventNormalization,
} from './event-change-bridge';
import { isRecord } from './record';
import {
  assertYjsSchemaIdentity,
  getYjsSchemaMetadataName,
  readYjsSchemaEnvelope,
  writeYjsSchemaEnvelope,
} from './schema-metadata';
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

type YjsRootBinding = {
  readonly bridge: YjsEventChangeBridge;
  readonly emptyValue: readonly Descendant[];
  readonly root: Y.XmlElement;
  synchronizedChildren: readonly Descendant[];
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
  private readonly isSetValued: YjsSetPropertyResolver;
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
  private pendingRemoteRootChange = false;
  private pendingRemoteSchemaChange = false;
  private published = false;
  private readinessUnsubscribe: (() => void) | undefined;
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
    this.rootName = options.rootName ?? 'plitejs';
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
    this.sharedEffectLog = new YjsSharedEffectLog(
      this.doc,
      this.rootName,
      this.root,
      (key) => getPluginRegistry(editor).effectTypes.get(key)?.type,
      {
        authorityId: options.sharedEffectCompaction?.authorityId,
        editor,
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
      this.createRootBinding(MAIN_ROOT_KEY, this.root, Object.freeze([]))
    );
    for (const [root, yRoot] of this.roots) {
      if (!(yRoot instanceof Y.XmlElement)) {
        throw new Error(`Yjs named root "${root}" must be a Y.XmlElement.`);
      }
      this.bindings.set(
        root,
        this.createRootBinding(root, yRoot, Object.freeze([]))
      );
    }
    this.awarenessAdapter = this.awareness
      ? createYjsAwarenessAdapter<TCursorData>({
          awareness: this.awareness,
          canSyncSelection: () => this.admissionStatusValue.state === 'ready',
          editor: this.editor,
          rootFor: (root) => this.rootFor(root),
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
        this.disposed ||
        !this.published ||
        this.shouldIgnoreRemoteTransaction(transaction) ||
        this.sharedEffectLog.isInternalTransaction(transaction)
      ) {
        return;
      }

      this.processAvailableInput();
    };
  }

  private createRootBinding(
    root: string,
    yRoot: Y.XmlElement,
    synchronizedChildren: readonly Descendant[]
  ): YjsRootBinding {
    const bridge = new YjsEventChangeBridge(
      yRoot,
      root,
      synchronizedChildren,
      this.isSetValued,
      this.editor.read.schema.hasContentRoots()
        ? (node) => node
        : (node) => this.editorAdapter.canonicalizeNode(root, node)
    );

    return {
      bridge,
      emptyValue: this.emptyValueFor(root),
      root: yRoot,
      synchronizedChildren,
    };
  }

  private rootFor(root: string): Y.XmlElement | null {
    if (root === MAIN_ROOT_KEY) return this.root;

    const yRoot = this.roots.get(root);

    return yRoot instanceof Y.XmlElement ? yRoot : null;
  }

  initializeCanonicalState(): void {
    if (this.initialized) return;

    for (const [root, binding] of this.bindings) {
      binding.synchronizedChildren = this.editorAdapter.readChildren(root);
      binding.bridge.reset(binding.synchronizedChildren);
    }

    this.schemaMetadata.observe(this.schemaObserver);
    this.root.observeDeep(this.observer);
    this.roots.observeDeep(this.rootsObserver);
    this.sharedEffectLog.observe(this.sharedEffectsObserver);
    this.doc.on('afterTransaction', this.afterTransactionObserver);

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
      this.sharedEffectLog.unobserve(this.sharedEffectsObserver);
      this.doc.off('afterTransaction', this.afterTransactionObserver);
      throw error;
    }
  }

  destroy(): void {
    if (this.disposed) return;

    this.disposed = true;
    this.unregisterTransactionGuard?.();
    this.unregisterTransactionGuard = undefined;
    this.sharedEffectLog.destroy();
    if (this.initialized) {
      this.initialized = false;
      this.unbindExternalEvents();
      this.schemaMetadata.unobserve(this.schemaObserver);
      this.root.unobserveDeep(this.observer);
      this.roots.unobserveDeep(this.rootsObserver);
      this.sharedEffectLog.unobserve(this.sharedEffectsObserver);
      this.doc.off('afterTransaction', this.afterTransactionObserver);
    }
    this.awarenessAdapter?.destroy();
    this.admissionSubscribers.clear();
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
    this.readinessUnsubscribe?.();
    this.readinessUnsubscribe = undefined;
    this.awareness?.off('change', this.awarenessObserver);
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

    const view = getAuthoredCommitView(this.editor, commit);
    const cursorCache = this.awarenessAdapter?.forView(view);
    if (readAuthoredView(this.editor)) {
      const projected = getAuthoredProjectedChange(this.editor, commit);
      this.awarenessAdapter?.publishMappedRoots(
        new Set([
          ...getDocumentChangeRootKeys(commit.changes),
          ...getDocumentChangeRootKeys(projected),
          ...commit.changes.createRoots,
          ...commit.changes.deleteRoots,
          ...projected.createRoots,
          ...projected.deleteRoots,
        ])
      );
    }
    const sharedEffects = getCollabEffects(this.editor, commit);
    const shouldSyncSelection =
      cursorCache !== undefined &&
      getAuthoredViewCommit(view, commit).selectionChanged;

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

    if (readAuthoredView(this.editor)) {
      const prepared = this.sharedEffectLog.prepare(sharedEffects, commit);
      this.doc.transact(() => {
        this.appendSharedEffects(prepared);
      }, this.localOrigin);
      this.sharedEffectLog.settle();
      if (shouldSyncSelection) cursorCache.syncSelection();
      return;
    }

    let committedValue: ReturnType<YjsEditorAdapter['readValue']> | undefined;
    let previousCommittedValue:
      | ReturnType<YjsEditorAdapter['readValue']>
      | undefined;
    const changedRoots = new Set<string>();

    if (commit.changed.hasAny('document')) {
      committedValue = this.editorAdapter.readValue();
      previousCommittedValue = commit.inverseChanges.apply(committedValue);
      for (const root of getDocumentChangeRootKeys(commit.changes)) {
        changedRoots.add(root);
      }
      for (const root of commit.changes.createRoots) {
        changedRoots.add(root);
      }
      for (const root of commit.changes.deleteRoots) {
        changedRoots.add(root);
      }
      for (const root of new Set([
        ...Object.keys(previousCommittedValue.roots ?? {}),
        ...Object.keys(committedValue.roots ?? {}),
      ])) {
        if (
          Object.hasOwn(previousCommittedValue.roots ?? {}, root) !==
          Object.hasOwn(committedValue.roots ?? {}, root)
        ) {
          changedRoots.add(root);
        }
      }
    }
    const documentChanged = changedRoots.size > 0;

    if (!documentChanged && sharedEffects.length === 0) {
      if (shouldSyncSelection) cursorCache.syncSelection();

      return;
    }
    const preparedSharedEffects = this.sharedEffectLog.prepare(sharedEffects);

    if (!documentChanged) {
      this.doc.transact(() => {
        this.appendSharedEffects(preparedSharedEffects);
      }, this.localOrigin);
      this.sharedEffectLog.settle();

      if (shouldSyncSelection) cursorCache.syncSelection();

      return;
    }

    if (committedValue === undefined || previousCommittedValue === undefined) {
      throw new Error('Cannot synchronize a changed document without values.');
    }

    const after = committedValue;
    const before = previousCommittedValue;
    const removedBindings: string[] = [];
    const fallbacks = new Set<string>([
      ...commit.changes.createRoots,
      ...commit.changes.deleteRoots,
    ]);

    this.doc.transact(() => {
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

        const expectedChildren =
          root === MAIN_ROOT_KEY ? after.children : (after.roots?.[root] ?? []);
        const canonicalBefore =
          root === MAIN_ROOT_KEY
            ? before.children
            : (before.roots?.[root] ?? []);
        let binding = this.bindings.get(root);

        if (!binding) {
          const yRoot = new Y.XmlElement();

          this.roots.set(root, yRoot);
          binding = this.createRootBinding(root, yRoot, Object.freeze([]));
          this.bindings.set(root, binding);
          replaceYjsChildren(binding.root, expectedChildren, this.isSetValued, {
            ancestors: [],
            path: [],
            root,
          });
          binding.synchronizedChildren = expectedChildren;
          binding.bridge.reset(expectedChildren);
          this.traceEntries.push({
            changedChildren: expectedChildren.length,
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
        const incremental =
          changedRoots.size === 1 && !this.editor.read.schema.hasContentRoots()
            ? binding.bridge.lower(commit.changes, expectedChildren, {
                structureChanged,
              })
            : null;
        const result =
          incremental?.kind === 'lowered'
            ? incremental
            : incremental === null
              ? reconcileYjsRoot(
                  binding.root,
                  this.readYjsRootValue(binding),
                  expectedChildren,
                  this.isSetValued,
                  root === MAIN_ROOT_KEY ? null : root
                )
              : lowerDocumentChangeToYjs({
                  base: canonicalBefore,
                  canonicalize: (children) =>
                    this.canonicalizeRootInDocument(root, children, before),
                  change: commit.changes,
                  emptyValue: binding.emptyValue,
                  expected: expectedChildren,
                  isSetValued: this.isSetValued,
                  knownYjsValue: binding.synchronizedChildren,
                  root,
                  yRoot: binding.root,
                });

        if (incremental?.kind === 'fallback') {
          fallbacks.add(root);
        }

        this.traceEntries.push({
          canonicalStrategy: result.strategy,
          changedChildren: result.inserted + result.removed,
          ...(incremental?.kind === 'lowered'
            ? { changedRanges: incremental.changedRanges }
            : {}),
          ...(incremental?.kind === 'lowered'
            ? { tokenLengthNodes: incremental.tokenLengthNodes }
            : {}),
          ...(incremental?.kind === 'fallback'
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
        binding.synchronizedChildren = this.editorAdapter.readChildren(root);
        binding.bridge.reset(binding.synchronizedChildren);
      } else {
        binding.synchronizedChildren = this.editorAdapter.readChildren(root);
      }
    }
    this.awarenessAdapter?.publishMappedRoots(changedRoots, {
      fallbackRoots: fallbacks,
    });
    if (shouldSyncSelection) cursorCache.syncSelection();
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
    this.pendingRemoteEffects = false;
    this.pendingRemoteSchemaChange = false;
  }

  private processAvailableInput(): void {
    if (this.disposed || this.admissionAttempting) return;

    this.admissionAttempting = true;
    try {
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
          this.importDocumentFromYjs('seed', pending.effects);
        } else {
          this.seedInitialValue();
          if (pending.effects.length > 0) {
            this.editorAdapter.applyRemote({ effects: pending.effects });
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

      this.sharedEffectLog.settle();
      this.publishReady();
    } catch (error) {
      this.setAdmissionError(error);
    } finally {
      this.admissionAttempting = false;
    }
  }

  private assertRoomSchemaForImport(): boolean {
    const envelope = readYjsSchemaEnvelope(this.schemaMetadata);

    if (envelope === null) {
      if (
        this.root.length === 0 &&
        this.roots.size === 0 &&
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
      !this.pendingRemoteEffects &&
      !this.pendingRemoteSchemaChange
    ) {
      return;
    }

    const rootChanged = this.pendingRemoteRootChange;
    const namedRoots = new Set(this.pendingRemoteNamedRoots);
    const events = this.pendingRemoteEvents;
    const pending = this.sharedEffectLog.pending();

    if (readAuthoredView(this.editor)) {
      this.importDocumentFromYjs('remote-reconcile', pending.effects);
    } else if (!rootChanged && namedRoots.size === 1 && events !== null) {
      this.importYjsEvents(events, pending.effects, [...namedRoots][0]);
    } else if (namedRoots.size > 0) {
      this.importDocumentFromYjs('remote-reconcile', pending.effects, {
        main: rootChanged,
        named: namedRoots,
      });
    } else if (rootChanged) {
      if (events === null) {
        this.importFromYjs('remote-reconcile', pending.effects);
      } else {
        this.importYjsEvents(events, pending.effects);
      }
    } else if (pending.effects.length > 0) {
      this.editorAdapter.applyRemote({ effects: pending.effects });
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

  private seedInitialValue(): void {
    this.seedValue(this.editorAdapter.readValue());
  }

  private seedValue(value: JsonEditorValue): void {
    const snapshots = this.sharedEffectLog.prepare(
      this.captureSharedSnapshotEffects()
    );
    this.doc.transact(() => {
      const envelope = readYjsSchemaEnvelope(this.schemaMetadata);
      const identity = this.localSchemaIdentity();

      if (envelope === null) {
        writeYjsSchemaEnvelope(this.schemaMetadata, identity);
      } else {
        assertYjsSchemaIdentity(identity, envelope.identity);
      }

      if (!readAuthoredView(this.editor)) {
        replaceYjsChildren(
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
          replaceYjsChildren(yRoot, asDescendants(children), this.isSetValued, {
            ancestors: [],
            path: [],
            root,
          });
        }
      }
      this.appendSharedEffects(snapshots);
    }, this.seedOrigin);
    if (!readAuthoredView(this.editor)) this.resetBindingsFromYjs();
    this.traceEntries.push({ mode: 'seed' });
  }

  private importFromYjs(
    mode: YjsTraceEntry['mode'] = 'remote-reconcile',
    effects: readonly PendingYjsEffect[] = [],
    trace: {
      fallback?: YjsEventImportFallback;
      importKind?: YjsTraceEntry['importKind'];
    } = {}
  ): void {
    this.doc.transact(() => {
      removeRedundantEmptyYjsTextNodes(this.root);
    }, this.canonicalizeOrigin);

    const binding = this.bindings.get(MAIN_ROOT_KEY);

    if (!binding) {
      throw new Error('Yjs primary root binding is unavailable.');
    }

    const before = this.editorAdapter.readChildren(MAIN_ROOT_KEY);
    const children = this.editorAdapter.canonicalize(
      MAIN_ROOT_KEY,
      this.readYjsRootValue(binding)
    );
    const change = createRootDocumentChange(
      MAIN_ROOT_KEY,
      before,
      children,
      this.isSetValued
    );

    this.traceEntries.push({
      changedChildren: countChangedTopLevelChildren(before, children),
      ...(trace.fallback ? { fallback: trace.fallback } : {}),
      importKind: trace.importKind ?? 'snapshot-change',
      mode,
    });
    this.editorAdapter.applyRemote({
      change,
      effects,
      selection: this.currentSelection(),
    });
    binding.synchronizedChildren = children;
    binding.bridge.reset(children);
    const changedRoots = new Set([MAIN_ROOT_KEY]);

    this.awarenessAdapter?.publishMappedRoots(changedRoots, {
      fallbackRoots: changedRoots,
    });
  }

  private importDocumentFromYjs(
    mode: YjsTraceEntry['mode'] = 'remote-reconcile',
    effects: readonly PendingYjsEffect[] = [],
    changed?: Readonly<{
      main: boolean;
      named: ReadonlySet<string>;
    }>
  ): void {
    if (readAuthoredView(this.editor)) {
      if (this.root.length || this.roots.size) {
        throw new Error('Authored Yjs documents require a native checkpoint.');
      }
      if (effects.length) this.editorAdapter.applyRemote({ effects });
      this.traceEntries.push({ mode });
      return;
    }
    const namedRoots =
      changed?.named ??
      new Set([
        ...Object.keys(this.editorAdapter.readValue().roots ?? {}),
        ...this.roots.keys(),
      ]);

    this.doc.transact(() => {
      if (changed?.main ?? true) {
        removeRedundantEmptyYjsTextNodes(this.root);
      }
      for (const root of namedRoots) {
        const yRoot = this.roots.get(root);

        if (yRoot === undefined) continue;
        if (!(yRoot instanceof Y.XmlElement)) {
          throw new Error('A Yjs named root must be a Y.XmlElement.');
        }
        removeRedundantEmptyYjsTextNodes(yRoot);
      }
    }, this.canonicalizeOrigin);

    const before = this.editorAdapter.readValue();
    const next = this.readYjsDocumentValue(before, {
      main: changed?.main ?? true,
      named: namedRoots,
    });
    const change = DocumentChange.between(before, next);
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

    this.editorAdapter.applyRemote({
      change,
      effects,
      selection: this.currentSelection(),
    });
    this.resetBindingsFromYjs({
      main: changed?.main ?? true,
      named: namedRoots,
    });
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
        binding = this.createRootBinding(root, yRoot, Object.freeze([]));
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
    return readPliteValueFromYjs(binding.root, binding.emptyValue);
  }

  private canonicalizeRootInDocument(
    root: string,
    children: readonly Descendant[],
    document: JsonEditorValue
  ): readonly Descendant[] {
    const value = this.editorAdapter.canonicalizeDocument(
      root === MAIN_ROOT_KEY
        ? { ...document, children }
        : {
            ...document,
            roots: {
              ...document.roots,
              [root]: children,
            },
          }
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
      primary.synchronizedChildren =
        this.editorAdapter.readChildren(MAIN_ROOT_KEY);
      primary.bridge.reset(primary.synchronizedChildren);
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
        binding = this.createRootBinding(root, yRoot, Object.freeze([]));
        this.bindings.set(root, binding);
      }
      binding.synchronizedChildren = this.editorAdapter.readChildren(root);
      binding.bridge.reset(binding.synchronizedChildren);
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
    effects: readonly PendingYjsEffect[],
    root = MAIN_ROOT_KEY
  ): void {
    const binding = this.bindings.get(root);

    if (!binding) {
      throw new Error(`Yjs root binding "${root}" is unavailable.`);
    }
    let normalization: YjsEventNormalization = {
      changedNodes: new Set(),
      removedNodes: new Set(),
    };

    this.doc.transact(() => {
      normalization = binding.bridge.normalize(events);
    }, this.canonicalizeOrigin);

    const result = binding.bridge.translate(events, normalization);

    if (result.kind === 'fallback') {
      this.importFromYjs('remote-reconcile', effects, {
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
    this.editorAdapter.applyRemote({
      change: result.import.change,
      effects,
      selection: this.currentSelection(),
    });
    binding.synchronizedChildren = result.import.children;
    result.import.accept(binding.synchronizedChildren);
    this.awarenessAdapter?.publishMappedRoots(new Set([root]));
  }
}
