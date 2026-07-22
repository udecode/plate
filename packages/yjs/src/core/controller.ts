import type {
  Descendant,
  Editor,
  EditorCommit,
  EditorEffect,
  EditorSchemaIdentity,
  EditorSnapshot,
  EditorUpdateTransaction,
} from '@platejs/plite';
import {
  areEditorSchemaIdentitiesEqual,
  createEditorEffect,
  getCompiledEditorSchema,
  getCompiledPropertyMergeStrategy,
  getCollabEffects,
  getEditorExtensionRegistry,
  getSnapshot,
  MAIN_ROOT_KEY,
  scheduleAfterCommitNotification,
  toInternalRoot,
} from '@platejs/plite/internal';
import * as Y from 'yjs';

import {
  createYjsAwarenessAdapter,
  type YjsAwarenessAdapter,
} from './awareness-adapter';
import {
  applyRootDocumentChange,
  countChangedTopLevelChildren,
  createRootDocumentChange,
  lowerDocumentChangeToYjs,
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
import {
  captureYjsEventBatch,
  type CapturedYjsEventBatch,
  mergeYjsEventBatches,
  YjsEventChangeBridge,
  type YjsEventImportFallback,
} from './event-change-bridge';
import {
  createYjsProviderLifecycleAdapter,
  type YjsProviderLifecycleAdapter,
} from './provider-lifecycle-adapter';
import {
  createYjsSplitHistoryAdapter,
  type YjsSplitHistoryAdapter,
} from './split-history-adapter';
import {
  type PreparedYjsSharedEffects,
  YjsSharedEffectLog,
} from './shared-effect-log';
import {
  assertYjsSchemaIdentity,
  getYjsSchemaMetadataName,
  readYjsSchemaEnvelope,
  writeYjsSchemaEnvelope,
} from './schema-metadata';
import type {
  YjsAwarenessChange,
  YjsAwarenessLike,
  YjsExtensionOptions,
  YjsProviderLike,
  YjsState,
  YjsTraceEntry,
  YjsTx,
} from './types';
import { createYjsUndoManagerAdapter } from './undo-manager-adapter';

const notifySubscribers = (subscribers: ReadonlySet<() => void>): void => {
  for (const listener of subscribers) {
    listener();
  }
};

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
    index++;
  }

  return copy;
};

export class YjsController {
  private readonly autoSendSelection: boolean;
  private readonly awareness?: YjsAwarenessLike;
  private readonly awarenessAdapter: YjsAwarenessAdapter;
  private readonly awarenessDataField: string;
  private readonly awarenessObserver: (event: YjsAwarenessChange) => void;
  private readonly awarenessSelectionField: string;
  private readonly awarenessSubscribers = new Set<() => void>();
  private readonly clientId: number | string;
  private readonly destroyProviderOnUnmount: boolean;
  private readonly doc: Y.Doc;
  private readonly editor: Editor;
  private readonly editorAdapter: YjsEditorAdapter;
  private readonly editorRoot: string;
  private readonly emptyYjsValue: readonly Descendant[];
  private readonly eventChangeBridge: YjsEventChangeBridge;
  private readonly canonicalizeOrigin = {};
  private readonly historyOrigin = {};
  private readonly isSetValued: YjsSetPropertyResolver;
  private readonly localOrigin = {};
  private readonly seedOrigin = {};
  private readonly observer: (
    events: Y.YEvent<Y.AbstractType<unknown>>[],
    transaction: Y.Transaction
  ) => void;
  private readonly provider?: YjsProviderLike;
  private readonly providerLifecycle: YjsProviderLifecycleAdapter;
  private readonly providerOwnedDoc: boolean;
  private readonly root: Y.XmlElement;
  private readonly schemaMetadata: Y.Map<unknown>;
  private readonly schemaObserver: (
    event: Y.YMapEvent<unknown>,
    transaction: Y.Transaction
  ) => void;
  private readonly schemaRoot: string | null;
  private readonly sharedEffectLog: YjsSharedEffectLog;
  private readonly sharedEffectsObserver: (
    event: Y.YArrayEvent<unknown>,
    transaction: Y.Transaction
  ) => void;
  private readonly afterTransactionObserver: (
    transaction: Y.Transaction
  ) => void;
  private readonly seedProviderOnSync: boolean;
  private readonly traceEntries: YjsTraceEntry[] = [];
  private readonly undoManager: Y.UndoManager;
  private readonly splitHistory: YjsSplitHistoryAdapter;

  private awarenessRevision = 0;
  private paused = false;
  private pendingRemoteEvents: CapturedYjsEventBatch | null = null;
  private pendingRemoteEffects = false;
  private pendingRemoteRootChange = false;
  private pendingRemoteSchemaChange = false;
  private pendingRemoteSplitRepair = true;
  private schemaError: Error | null = null;
  private seeded = false;
  private initialized = false;
  private synchronizedChildren: readonly Descendant[];

  constructor(
    editor: Editor,
    options: YjsExtensionOptions,
    context: Readonly<{
      canonicalize: YjsEditorAdapter['canonicalize'];
      emptyYjsValue: readonly Descendant[];
      root: string;
    }>,
    previous?: YjsController
  ) {
    this.editor = editor;
    this.editorRoot = context.root;
    this.emptyYjsValue = context.emptyYjsValue;
    this.schemaRoot = context.root === MAIN_ROOT_KEY ? null : context.root;
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
    this.provider = options.provider;
    this.providerOwnedDoc =
      this.provider !== undefined &&
      (options.doc !== undefined || this.provider.doc !== undefined);
    this.doc = options.doc ?? this.provider?.doc ?? new Y.Doc();
    const rootName = options.rootName ?? '@platejs/plite';

    this.root = this.doc.get(rootName, Y.XmlElement);
    this.schemaMetadata = this.doc.getMap(getYjsSchemaMetadataName(rootName));
    this.synchronizedChildren = Object.freeze([]);
    this.eventChangeBridge = new YjsEventChangeBridge(
      this.root,
      this.editorRoot,
      this.synchronizedChildren,
      this.isSetValued,
      this.editorAdapter.canonicalizeNode
    );
    this.sharedEffectLog = new YjsSharedEffectLog(
      this.doc,
      rootName,
      this.root,
      (key) => getEditorExtensionRegistry(editor).effectTypes.get(key)?.type,
      {
        authorityId: options.sharedEffectCompaction?.authorityId,
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
    this.clientId = options.clientId ?? this.doc.clientID;
    this.destroyProviderOnUnmount = options.destroyProviderOnUnmount ?? false;
    this.seedProviderOnSync = options.seedProviderOnSync ?? true;
    this.awareness = options.awareness ?? this.provider?.awareness;
    this.awarenessDataField = options.awarenessDataField ?? 'data';
    this.awarenessSelectionField =
      options.awarenessSelectionField ?? 'selection';
    this.autoSendSelection = options.autoSendSelection ?? true;
    this.awarenessObserver = () => {
      this.updateAwarenessRevision();
    };
    this.providerLifecycle = createYjsProviderLifecycleAdapter({
      onConnectedChange: (connected) => {
        if (!connected) {
          this.awarenessAdapter.clearSelection();
        }
        this.updateAwarenessRevision();
      },
      onProviderSyncedChange: () => this.reconcileProviderOwnedDocAfterSync(),
      provider: this.provider,
    });
    this.undoManager =
      previous?.doc === this.doc &&
      previous.root === this.root &&
      previous.editorRoot === this.editorRoot
        ? previous.undoManager
        : new Y.UndoManager(this.root, {
            trackedOrigins: new Set([this.localOrigin]),
          });
    this.undoManager.addTrackedOrigin(this.localOrigin);
    this.undoManager.stopCapturing();
    const undoManagerAdapter = createYjsUndoManagerAdapter(this.undoManager);

    this.splitHistory = createYjsSplitHistoryAdapter({
      doc: this.doc,
      editorRoot: this.editorRoot,
      historyOrigin: this.historyOrigin,
      isSetValued: this.isSetValued,
      isConnected: () => this.providerLifecycle.connected(),
      root: this.root,
      schemaRoot: this.schemaRoot,
      undoManagerAdapter,
    });
    this.awarenessAdapter = createYjsAwarenessAdapter({
      awareness: this.awareness,
      awarenessDataField: this.awarenessDataField,
      awarenessSelectionField: this.awarenessSelectionField,
      canSendSelection: () =>
        !this.shouldWaitForProviderSync() &&
        !this.shouldWaitForAppSeededProviderDoc(),
      clientId: this.clientId,
      doc: this.doc,
      editor: this.editor,
      editorRoot: this.editorRoot,
      isConnected: () => this.providerLifecycle.connected(),
      root: this.root,
    });
    this.observer = (events, transaction) => {
      if (this.shouldIgnoreRemoteTransaction(transaction)) return;

      this.pendingRemoteEvents = mergeYjsEventBatches(
        this.pendingRemoteEvents,
        captureYjsEventBatch(events)
      );
      this.pendingRemoteRootChange = true;
      if (transaction.origin === this.historyOrigin) {
        this.pendingRemoteSplitRepair = false;
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
    this.afterTransactionObserver = () => {
      if (!this.seeded) return;
      if (this.shouldWaitForProviderSync()) return;

      this.assertRoomSchemaForImport();

      this.flushRemoteTransaction();
      this.sharedEffectLog.settle();
    };
  }

  initializeCanonicalState(): void {
    if (this.initialized) return;

    const schemaEnvelope = readYjsSchemaEnvelope(this.schemaMetadata);
    const isUnclaimedDocument = schemaEnvelope === null;

    this.synchronizedChildren =
      this.providerOwnedDoc || isUnclaimedDocument
        ? getSnapshot(this.editor).children
        : this.editorAdapter.canonicalize(this.readYjsValue());
    this.eventChangeBridge.reset(this.synchronizedChildren);

    if (
      !this.providerOwnedDoc ||
      this.providerLifecycle.providerSynced() === true
    ) {
      this.assertRoomSchemaForImport();
    }

    this.schemaMetadata.observe(this.schemaObserver);
    this.root.observeDeep(this.observer);
    this.sharedEffectLog.observe(this.sharedEffectsObserver);
    this.doc.on('afterTransaction', this.afterTransactionObserver);

    try {
      this.bindExternalEvents();
      this.initialized = true;
    } catch (error) {
      this.unbindExternalEvents();
      this.schemaMetadata.unobserve(this.schemaObserver);
      this.root.unobserveDeep(this.observer);
      this.sharedEffectLog.unobserve(this.sharedEffectsObserver);
      this.doc.off('afterTransaction', this.afterTransactionObserver);
      throw error;
    }
  }

  destroy(replacement?: YjsController): void {
    this.seeded = false;
    this.sharedEffectLog.destroy();
    if (this.initialized) {
      this.initialized = false;
      this.unbindExternalEvents();
      if (
        this.awareness !== undefined &&
        replacement?.awareness !== this.awareness
      ) {
        this.awarenessAdapter.clearSelection();
      }
      this.schemaMetadata.unobserve(this.schemaObserver);
      this.root.unobserveDeep(this.observer);
      this.sharedEffectLog.unobserve(this.sharedEffectsObserver);
      this.doc.off('afterTransaction', this.afterTransactionObserver);
    }
    if (
      this.destroyProviderOnUnmount &&
      replacement?.provider !== this.provider
    ) {
      this.provider?.destroy?.();
    }
    if (replacement?.undoManager === this.undoManager) {
      this.undoManager.removeTrackedOrigin(this.localOrigin);
    } else {
      this.undoManager.destroy();
    }
  }

  private bindExternalEvents(): void {
    this.awareness?.on?.('change', this.awarenessObserver);
    this.providerLifecycle.bind();
  }

  private unbindExternalEvents(): void {
    this.awareness?.off?.('change', this.awarenessObserver);
    this.providerLifecycle.unbind();
  }

  handleCommit(commit: EditorCommit, snapshot: EditorSnapshot): void {
    if (
      this.seeded &&
      !this.paused &&
      commit.dirtyStateKeys.includes('$configuration')
    ) {
      scheduleAfterCommitNotification(this.editor, () => {
        if (!this.seeded || this.paused) return;

        this.pendingRemoteEffects = true;
        this.flushRemoteTransaction();
      });
    }

    const sharedEffects = getCollabEffects(this.editor, commit);
    const shouldSendSelection =
      this.autoSendSelection && commit.selectionChanged;

    if (
      this.shouldSkipCommit(
        commit,
        sharedEffects.length > 0,
        shouldSendSelection
      )
    ) {
      return;
    }

    const selectionRoot = toInternalRoot(commit.selectionAfterRoot);
    const rootChanged =
      this.editorRoot === MAIN_ROOT_KEY
        ? commit.changed.has('document')
        : commit.changed.has('document', this.editorRoot);
    if (!rootChanged && sharedEffects.length === 0) {
      if (shouldSendSelection) {
        this.awarenessAdapter.sendSelection(
          selectionRoot === this.editorRoot ? snapshot.selection : null
        );
      }

      return;
    }

    if (this.shouldRejectUnsafeProviderCommit()) {
      scheduleAfterCommitNotification(this.editor, () => {
        const currentChildren = this.editorAdapter.readChildren();
        const previousValue = rootChanged
          ? commit.inverseChanges.apply(this.editor.read.value())
          : this.editor.read.value();

        try {
          this.editor.read.schema.validateDocument(previousValue);
        } catch {
          return;
        }

        const previousChildren =
          this.editorRoot === MAIN_ROOT_KEY
            ? previousValue.children
            : (previousValue.roots?.[this.editorRoot] ?? []);

        this.editorAdapter.applyRemote({
          ...(rootChanged
            ? {
                change: createRootDocumentChange(
                  this.editorRoot,
                  currentChildren,
                  previousChildren,
                  this.isSetValued
                ),
                selection: commit.selectionBefore,
              }
            : {}),
          effects: [...sharedEffects].reverse().map((effect) => ({
            type: effect.type,
            value: effect.type.invert(effect.value),
          })),
        });
      });

      return;
    }
    if (this.shouldSeedEmptyProviderDocForCommit()) {
      this.seedValue(
        applyRootDocumentChange(
          commit.inverseChanges,
          this.editorRoot,
          this.editorAdapter.readChildren()
        )
      );
    }
    const preparedSharedEffects = this.sharedEffectLog.prepare(sharedEffects);

    if (!rootChanged) {
      this.undoManager.stopCapturing();
      this.doc.transact(() => {
        this.appendSharedEffects(preparedSharedEffects);
      }, this.localOrigin);
      this.undoManager.stopCapturing();

      if (shouldSendSelection) {
        this.awarenessAdapter.sendSelection(
          selectionRoot === this.editorRoot ? snapshot.selection : null
        );
      }

      return;
    }

    const expectedChildren = this.editorAdapter.readChildren();
    const canonicalBefore =
      this.editorRoot === MAIN_ROOT_KEY
        ? commit.before.children
        : applyRootDocumentChange(
            commit.inverseChanges,
            this.editorRoot,
            expectedChildren
          );
    const publicRoot =
      this.editorRoot === MAIN_ROOT_KEY ? undefined : this.editorRoot;
    const structureChanged = commit.changed.has('structure', publicRoot);

    const splitHistory = this.splitHistory.createFromChange({
      after: expectedChildren,
      before: canonicalBefore,
      change: commit.changes,
      paths: commit.changed.paths(publicRoot),
      structureChanged,
    });
    let usedSnapshotFallback = false;

    this.undoManager.stopCapturing();
    this.doc.transact(() => {
      const incremental = this.eventChangeBridge.lower(
        commit.changes,
        expectedChildren,
        { splitHistory, structureChanged }
      );
      const result =
        incremental.kind === 'lowered'
          ? incremental
          : lowerDocumentChangeToYjs({
              base: canonicalBefore,
              canonicalize: this.editorAdapter.canonicalize,
              change: commit.changes,
              emptyValue: this.emptyYjsValue,
              expected: expectedChildren,
              isSetValued: this.isSetValued,
              knownYjsValue: this.synchronizedChildren,
              root: this.editorRoot,
              yRoot: this.root,
            });

      usedSnapshotFallback = incremental.kind === 'fallback';

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
      });
      this.appendSharedEffects(preparedSharedEffects);
    }, this.localOrigin);
    this.splitHistory.store(splitHistory);
    if (usedSnapshotFallback) {
      this.synchronizedChildren = this.editorAdapter.canonicalize(
        this.readYjsValue()
      );
      this.eventChangeBridge.reset(this.synchronizedChildren);
    } else {
      this.synchronizedChildren = expectedChildren;
    }
    this.undoManager.stopCapturing();

    if (shouldSendSelection) {
      this.awarenessAdapter.sendSelection(
        selectionRoot === this.editorRoot ? snapshot.selection : null
      );
    }
  }

  handleTransactionChange(tx: EditorUpdateTransaction): void {
    if (this.shouldRejectUnsafeProviderCommit()) {
      tx.tags.add('history-skip');
    }
  }

  assertSchemaIdentity(next: EditorSchemaIdentity | null): void {
    const current = this.localSchemaIdentity();

    if (areEditorSchemaIdentitiesEqual(current, next)) {
      return;
    }
    if (
      this.providerOwnedDoc &&
      this.providerLifecycle.providerSynced() !== true
    ) {
      throw new Error(
        'Cannot reconfigure the editor schema before the Yjs provider is synchronized.'
      );
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

  seed(): void {
    this.sharedEffectLog.activate();

    if (this.shouldWaitForProviderSync()) {
      this.seeded = true;

      return;
    }

    this.assertRoomSchemaForImport();
    const pending = this.sharedEffectLog.pending();

    this.seedInitialValueOrImportFromYjs(
      this.shouldSeedInitialProviderDoc(),
      pending.effects
    );
    this.sharedEffectLog.acknowledge(pending.eventIds);
    this.pendingRemoteEvents = null;
    this.pendingRemoteRootChange = false;
    this.pendingRemoteEffects = false;
    this.pendingRemoteSchemaChange = false;
    this.pendingRemoteSplitRepair = true;
    this.seeded = true;
    this.sharedEffectLog.settle();
  }

  private assertRoomSchemaForImport(): boolean {
    try {
      const envelope = readYjsSchemaEnvelope(this.schemaMetadata);

      if (envelope === null) {
        if (this.root.length === 0) {
          this.schemaError = null;

          return false;
        }

        throw new Error(
          'Cannot import a nonempty Yjs document without schema metadata.'
        );
      }

      assertYjsSchemaIdentity(this.localSchemaIdentity(), envelope.identity);
      this.schemaError = null;

      return true;
    } catch (error) {
      this.schemaError =
        error instanceof Error ? error : new Error(String(error));
      throw error;
    }
  }

  private appendSharedEffects(effects: PreparedYjsSharedEffects): void {
    this.sharedEffectLog.append(effects);
  }

  private localSchemaIdentity(): EditorSchemaIdentity | null {
    return getCompiledEditorSchema(this.editor)?.identity ?? null;
  }

  private captureSharedSnapshotEffects(): readonly EditorEffect[] {
    return this.editor.read((state) => {
      const effects: EditorEffect[] = [];

      for (const { type } of getEditorExtensionRegistry(
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
      transaction.origin === this.seedOrigin ||
      this.paused
    );
  }

  private flushRemoteTransaction(): void {
    if (
      !this.pendingRemoteRootChange &&
      !this.pendingRemoteEffects &&
      !this.pendingRemoteSchemaChange
    ) {
      return;
    }

    const rootChanged = this.pendingRemoteRootChange;
    const events = this.pendingRemoteEvents;
    const repairRemoteSplitAfterOfflineUndo = this.pendingRemoteSplitRepair;
    const pending = this.sharedEffectLog.pending();

    this.pendingRemoteEvents = null;
    this.pendingRemoteRootChange = false;
    this.pendingRemoteEffects = false;
    this.pendingRemoteSchemaChange = false;
    this.pendingRemoteSplitRepair = true;

    if (rootChanged) {
      if (events === null) {
        this.importFromYjs(
          'remote-reconcile',
          { repairRemoteSplitAfterOfflineUndo },
          pending.effects
        );
      } else {
        this.importYjsEvents(
          events,
          { repairRemoteSplitAfterOfflineUndo },
          pending.effects
        );
      }
    } else if (pending.effects.length > 0) {
      this.editorAdapter.applyRemote({ effects: pending.effects });
    }
    this.sharedEffectLog.acknowledge(pending.eventIds);
  }

  private shouldSkipCommit(
    commit: EditorCommit,
    hasSharedEffects: boolean,
    shouldSendSelection: boolean
  ): boolean {
    return (
      this.editorAdapter.importing() ||
      this.paused ||
      (!(this.editorRoot === MAIN_ROOT_KEY
        ? commit.changed.has('document')
        : commit.changed.has('document', this.editorRoot)) &&
        !hasSharedEffects &&
        !shouldSendSelection) ||
      commit.tags.includes('skip-collab') ||
      commit.tags.includes('collaboration')
    );
  }

  state(): YjsState {
    return {
      awarenessRevision: () => this.awarenessRevision,
      clientId: () => this.clientId,
      connected: () => this.providerLifecycle.connected(),
      doc: () => this.doc,
      paused: () => this.paused,
      providerRevision: () => this.providerLifecycle.providerRevision(),
      providerStatus: () => this.providerLifecycle.providerStatus(),
      providerSynced: () => this.providerLifecycle.providerSynced(),
      remoteCursor: (clientId) => this.awarenessAdapter.remoteCursor(clientId),
      remoteCursors: () => this.awarenessAdapter.remoteCursors(),
      root: () => this.root,
      subscribeAwareness: (listener) => this.subscribeAwareness(listener),
      subscribeProvider: (listener) =>
        this.providerLifecycle.subscribe(listener),
      trace: () => copyTraceEntries(this.traceEntries),
    };
  }

  tx(): YjsTx {
    return {
      clearSelection: () => {
        this.awarenessAdapter.clearSelection();
      },
      clearTrace: () => {
        this.traceEntries.length = 0;
      },
      connect: () => {
        this.providerLifecycle.connect();
      },
      disconnect: () => {
        this.providerLifecycle.disconnect();
      },
      pause: () => {
        this.paused = true;
      },
      reconcile: () => {
        this.reconcile();
      },
      reconnect: () => {
        this.providerLifecycle.reconnect();
      },
      redo: () => {
        if (!this.splitHistory.redo()) {
          this.undoManager.redo();
        }
      },
      resume: () => {
        this.paused = false;
      },
      retireSharedEffectPeer: (peerId) => {
        this.sharedEffectLog.retirePeer(String(peerId));
      },
      sendCursorData: (data) => {
        this.awarenessAdapter.sendCursorData(data);
      },
      sendSelection: (range, data) => {
        this.awarenessAdapter.sendSelection(range, data);
      },
      undo: () => {
        if (!this.splitHistory.undo()) {
          this.undoManager.undo();
        }
      },
    };
  }

  private subscribeAwareness(listener: () => void): () => void {
    this.awarenessSubscribers.add(listener);

    return () => {
      this.awarenessSubscribers.delete(listener);
    };
  }

  private updateAwarenessRevision(): void {
    this.awarenessRevision += 1;

    notifySubscribers(this.awarenessSubscribers);
  }

  private reconcile(): void {
    if (this.shouldWaitForProviderSync()) return;

    this.assertRoomSchemaForImport();

    if (this.isProviderOwnedEmptyDoc()) {
      this.reconcileProviderOwnedDocAfterSync();

      return;
    }

    const pending = this.sharedEffectLog.pending();

    this.importFromYjs('remote-reconcile', {}, pending.effects);
    this.sharedEffectLog.acknowledge(pending.eventIds);
  }

  private shouldWaitForProviderSync(): boolean {
    return (
      this.providerOwnedDoc && this.providerLifecycle.providerSynced() !== true
    );
  }

  private shouldSeedEmptyProviderDocForCommit(): boolean {
    return (
      this.isProviderOwnedEmptyDoc() &&
      this.seedProviderOnSync &&
      this.providerLifecycle.providerSynced() === true
    );
  }

  private shouldSeedInitialProviderDoc(): boolean {
    return (
      (!this.providerOwnedDoc || this.seedProviderOnSync) &&
      !this.shouldWaitForProviderSync()
    );
  }

  private shouldRejectUnsafeProviderCommit(): boolean {
    return (
      this.shouldWaitForProviderSync() ||
      this.schemaError !== null ||
      (this.isProviderOwnedEmptyDoc() && !this.seedProviderOnSync)
    );
  }

  private shouldWaitForAppSeededProviderDoc(): boolean {
    return this.isProviderOwnedEmptyDoc();
  }

  private isProviderOwnedEmptyDoc(): boolean {
    return this.providerOwnedDoc && this.root.length === 0;
  }

  private seedInitialValue(): void {
    this.seedValue(this.editorAdapter.readChildren());
  }

  private seedValue(children: readonly Descendant[]): void {
    this.doc.transact(() => {
      const envelope = readYjsSchemaEnvelope(this.schemaMetadata);
      const identity = this.localSchemaIdentity();

      if (envelope === null) {
        writeYjsSchemaEnvelope(this.schemaMetadata, identity);
      } else {
        assertYjsSchemaIdentity(identity, envelope.identity);
      }

      replaceYjsChildren(this.root, children, this.isSetValued, {
        ancestors: [],
        path: [],
        root: this.schemaRoot,
      });
    }, this.seedOrigin);
    this.synchronizedChildren = this.editorAdapter.canonicalize(
      this.readYjsValue()
    );
    this.eventChangeBridge.reset(this.synchronizedChildren);
    this.traceEntries.push({ mode: 'seed' });
  }

  private seedInitialValueOrImportFromYjs(
    seedWhenEmpty: boolean,
    effects: readonly EditorEffect[] = []
  ): void {
    if (this.root.length === 0) {
      if (seedWhenEmpty) {
        this.seedInitialValue();
      }
      if (effects.length > 0) {
        this.editorAdapter.applyRemote({ effects });
      }

      return;
    }

    this.importFromYjs('seed', {}, effects);
  }

  private reconcileProviderOwnedDocAfterSync(): void {
    if (
      !this.seeded ||
      !this.providerOwnedDoc ||
      this.providerLifecycle.providerSynced() !== true
    ) {
      return;
    }

    const claimed = this.assertRoomSchemaForImport();

    if (!claimed && !this.seedProviderOnSync) return;

    const pending = this.sharedEffectLog.pending();

    this.seedInitialValueOrImportFromYjs(
      this.seedProviderOnSync,
      pending.effects
    );
    this.sharedEffectLog.acknowledge(pending.eventIds);
    this.pendingRemoteSchemaChange = false;
  }

  private importFromYjs(
    mode: YjsTraceEntry['mode'] = 'remote-reconcile',
    options: { repairRemoteSplitAfterOfflineUndo?: boolean } = {},
    effects: readonly EditorEffect[] = [],
    trace: {
      fallback?: YjsEventImportFallback;
      importKind?: YjsTraceEntry['importKind'];
    } = {}
  ): void {
    if (options.repairRemoteSplitAfterOfflineUndo ?? true) {
      this.splitHistory.repairAfterOfflineUndo();
    }

    this.doc.transact(() => {
      removeRedundantEmptyYjsTextNodes(this.root);
    }, this.canonicalizeOrigin);

    const before = this.editorAdapter.readChildren();
    const children = this.editorAdapter.canonicalize(this.readYjsValue());
    const change = createRootDocumentChange(
      this.editorRoot,
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
      selection: this.awarenessAdapter.currentSelection(),
    });
    this.synchronizedChildren = children;
    this.eventChangeBridge.reset(this.synchronizedChildren);
  }

  private readYjsValue(): readonly Descendant[] {
    return readPliteValueFromYjs(this.root, this.emptyYjsValue);
  }

  private importYjsEvents(
    events: CapturedYjsEventBatch,
    options: { repairRemoteSplitAfterOfflineUndo?: boolean },
    effects: readonly EditorEffect[]
  ): void {
    if (options.repairRemoteSplitAfterOfflineUndo ?? true) {
      this.splitHistory.repairAfterOfflineUndo();
    }

    let normalizedNodes: ReadonlySet<Y.XmlElement | Y.XmlText> = new Set();

    this.doc.transact(() => {
      normalizedNodes = this.eventChangeBridge.normalize(events);
    }, this.canonicalizeOrigin);

    const result = this.eventChangeBridge.translate(events, normalizedNodes);

    if (result.kind === 'fallback') {
      this.importFromYjs(
        'remote-reconcile',
        { repairRemoteSplitAfterOfflineUndo: false },
        effects,
        {
          fallback: result.fallback,
          importKind: 'full-diff-fallback',
        }
      );

      return;
    }

    this.traceEntries.push({
      changedChildren: result.import.changedChildren,
      changedRanges: result.import.changedRanges,
      importKind: 'event-change',
      mode: 'remote-reconcile',
      readTopLevelNodes: result.import.readTopLevelNodes,
    });
    this.editorAdapter.applyRemote({
      change: result.import.change,
      effects,
      selection: this.awarenessAdapter.currentSelection(),
    });
    this.synchronizedChildren = result.import.children;
    result.import.accept(this.synchronizedChildren);
  }
}
