import type {
  Descendant,
  Editor,
  EditorCommit,
  EditorSnapshot,
  Operation,
} from '@platejs/slate';
import * as Y from 'yjs';

import {
  createYjsAwarenessAdapter,
  type YjsAwarenessAdapter,
} from './awareness-adapter';
import {
  readSlateValueFromYjs,
  removeRedundantEmptyYjsTextNodes,
  replaceYjsChildren,
} from './document';
import {
  createYjsEditorAdapter,
  type YjsEditorAdapter,
} from './editor-adapter';
import {
  removeRejectedYjsOperationsFromHistory,
  removeRejectedYjsOperationsFromHistoryAfterCommit,
} from './history';
import {
  applySlateOperationToYjs,
  isNoopSlateOperationForYjs,
} from './operations';
import {
  createYjsProviderLifecycleAdapter,
  type YjsProviderLifecycleAdapter,
} from './provider-lifecycle-adapter';
import {
  createYjsSplitHistoryAdapter,
  type YjsSplitHistoryAdapter,
} from './split-history-adapter';
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

const collectYjsCommitOperations = (
  commit: EditorCommit,
  autoSendSelection: boolean
): {
  readonly operations: Operation[];
  readonly shouldSendSelection: boolean;
} => {
  const operations = new Array<Operation>(commit.operations.length);
  let operationCount = 0;
  let shouldSendSelection = false;
  let index = 0;

  while (index < commit.operations.length) {
    const operation = commit.operations[index];

    if (operation === undefined) {
      throw new Error('Cannot collect Yjs operations from a sparse commit.');
    }

    if (operation.type === 'set_selection') {
      shouldSendSelection = autoSendSelection || shouldSendSelection;
      index++;
      continue;
    }

    if (!isNoopSlateOperationForYjs(operation)) {
      operations[operationCount] = operation;
      operationCount++;
    }
    index++;
  }

  operations.length = operationCount;

  return { operations, shouldSendSelection };
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
  private readonly canonicalizeOrigin = {};
  private readonly historyOrigin = {};
  private readonly localOrigin = {};
  private readonly seedOrigin = {};
  private readonly observer: (
    events: Y.YEvent<Y.XmlElement>[],
    transaction: Y.Transaction
  ) => void;
  private readonly provider?: YjsProviderLike;
  private readonly providerLifecycle: YjsProviderLifecycleAdapter;
  private readonly providerOwnedDoc: boolean;
  private readonly root: Y.XmlElement;
  private readonly seedProviderOnSync: boolean;
  private readonly traceEntries: YjsTraceEntry[] = [];
  private readonly undoManager: Y.UndoManager;
  private readonly splitHistory: YjsSplitHistoryAdapter;

  private awarenessRevision = 0;
  private paused = false;

  constructor(editor: Editor, options: YjsExtensionOptions) {
    this.editor = editor;
    this.editorAdapter = createYjsEditorAdapter(editor);
    this.provider = options.provider;
    this.providerOwnedDoc =
      this.provider !== undefined &&
      (options.doc !== undefined || this.provider.doc !== undefined);
    this.doc = options.doc ?? this.provider?.doc ?? new Y.Doc();
    this.root = this.doc.get(
      options.rootName ?? '@platejs/slate',
      Y.XmlElement
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
    this.undoManager = new Y.UndoManager(this.root, {
      trackedOrigins: new Set([this.localOrigin]),
    });
    const undoManagerAdapter = createYjsUndoManagerAdapter(this.undoManager);

    this.splitHistory = createYjsSplitHistoryAdapter({
      doc: this.doc,
      historyOrigin: this.historyOrigin,
      isConnected: () => this.providerLifecycle.connected(),
      root: this.root,
      undoManagerAdapter,
    });
    this.awarenessAdapter = createYjsAwarenessAdapter({
      awareness: this.awareness,
      awarenessDataField: this.awarenessDataField,
      awarenessSelectionField: this.awarenessSelectionField,
      canSendSelection: () =>
        !this.shouldDeferProviderSeed() &&
        !this.shouldWaitForAppSeededProviderDoc(),
      clientId: this.clientId,
      doc: this.doc,
      editor: this.editor,
      isConnected: () => this.providerLifecycle.connected(),
      root: this.root,
    });
    this.observer = (_events, transaction) => {
      if (
        transaction.origin === this.localOrigin ||
        transaction.origin === this.canonicalizeOrigin ||
        transaction.origin === this.seedOrigin ||
        this.paused
      ) {
        return;
      }

      if (transaction.origin === this.historyOrigin) {
        this.importFromYjs('remote-reconcile', {
          repairRemoteSplitAfterOfflineUndo: false,
        });

        return;
      }

      this.importFromYjs();
    };

    this.bindExternalEvents();
  }

  destroy(): void {
    this.unbindExternalEvents();
    if (this.awareness !== undefined) {
      this.awarenessAdapter.clearSelection();
    }
    if (this.destroyProviderOnUnmount) {
      this.provider?.destroy?.();
    }
    this.root.unobserveDeep(this.observer);
    this.undoManager.destroy();
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
    if (this.shouldSkipCommit(commit)) {
      return;
    }

    const { operations, shouldSendSelection } = collectYjsCommitOperations(
      commit,
      this.autoSendSelection
    );

    if (operations.length === 0) {
      if (shouldSendSelection) {
        this.awarenessAdapter.sendSelection(snapshot.selection);
      }

      return;
    }

    if (this.shouldRejectUnsafeProviderCommit()) {
      removeRejectedYjsOperationsFromHistory(this.editor, operations);
      this.editorAdapter.replaceValue(
        this.editorAdapter.readChildrenBeforeOperations(operations),
        commit.selectionBefore
      );
      this.removeRejectedOperationsFromHistory(operations);

      return;
    }
    if (this.shouldSeedEmptyProviderDocForCommit()) {
      this.seedValue(
        this.editorAdapter.readChildrenBeforeOperations(operations)
      );
    }

    const splitHistory = this.splitHistory.createFromOperations(operations);
    const rejectedLocalOperations = new Array<Operation>(operations.length);
    let rejectedLocalOperationCount = 0;

    this.undoManager.stopCapturing();
    this.doc.transact(() => {
      let operationIndex = 0;

      while (operationIndex < operations.length) {
        const operation = operations[operationIndex];

        if (operation === undefined) {
          throw new Error('Cannot apply Yjs operations from a sparse array.');
        }

        const trace = this.applyOperation(operation);

        if (this.shouldImportAfterLocalFallback(trace)) {
          rejectedLocalOperations[rejectedLocalOperationCount] = operation;
          rejectedLocalOperationCount++;
        }
        operationIndex++;
      }
    }, this.localOrigin);
    this.splitHistory.store(splitHistory);
    this.undoManager.stopCapturing();

    if (rejectedLocalOperationCount > 0) {
      rejectedLocalOperations.length = rejectedLocalOperationCount;
      this.editorAdapter.replaceValue(
        readSlateValueFromYjs(this.root),
        snapshot.selection
      );
      this.removeRejectedOperationsFromHistory(rejectedLocalOperations);
    }

    if (shouldSendSelection) {
      this.awarenessAdapter.sendSelection(snapshot.selection);
    }
  }

  seed(): void {
    this.seedInitialValueOrImportFromYjs(this.shouldSeedInitialProviderDoc());
    this.root.observeDeep(this.observer);
  }

  private shouldSkipCommit(commit: EditorCommit): boolean {
    return (
      this.editorAdapter.importing() ||
      this.paused ||
      !commit.snapshotChanged ||
      commit.tags.includes('skip-collab') ||
      commit.tags.includes('collaboration') ||
      commit.metadata.collab?.origin === 'remote'
    );
  }

  private removeRejectedOperationsFromHistory(
    operations: readonly Operation[]
  ): void {
    removeRejectedYjsOperationsFromHistory(this.editor, operations);
    removeRejectedYjsOperationsFromHistoryAfterCommit(this.editor, operations);
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
    if (this.isProviderOwnedEmptyDoc()) {
      this.reconcileProviderOwnedDocAfterSync();

      return;
    }

    this.importFromYjs();
  }

  private shouldDeferProviderSeed(): boolean {
    return (
      this.isProviderOwnedEmptyDoc() &&
      this.providerLifecycle.providerSynced() !== true
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
      !this.shouldDeferProviderSeed()
    );
  }

  private shouldRejectUnsafeProviderCommit(): boolean {
    return (
      this.isProviderOwnedEmptyDoc() &&
      (!this.seedProviderOnSync ||
        this.providerLifecycle.providerSynced() !== true)
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
      replaceYjsChildren(this.root, children);
    }, this.seedOrigin);
    this.traceEntries.push({ mode: 'seed' });
  }

  private seedInitialValueOrImportFromYjs(seedWhenEmpty: boolean): void {
    if (this.root.length === 0) {
      if (seedWhenEmpty) {
        this.seedInitialValue();
      }

      return;
    }

    this.importFromYjs('seed');
  }

  private reconcileProviderOwnedDocAfterSync(): void {
    if (
      !this.providerOwnedDoc ||
      this.providerLifecycle.providerSynced() !== true
    ) {
      return;
    }

    this.seedInitialValueOrImportFromYjs(this.seedProviderOnSync);
  }

  private applyOperation(operation: Operation): YjsTraceEntry | null {
    const trace = applySlateOperationToYjs(this.root, operation);

    if (trace === null) {
      return null;
    }

    this.traceEntries.push(trace);

    return trace;
  }

  private shouldImportAfterLocalFallback(trace: YjsTraceEntry | null): boolean {
    return (
      trace?.mode === 'traceable-fallback' &&
      trace.fallback === 'incompatible-structural-merge-elided'
    );
  }

  private importFromYjs(
    mode: YjsTraceEntry['mode'] = 'remote-reconcile',
    options: { repairRemoteSplitAfterOfflineUndo?: boolean } = {}
  ): void {
    if (options.repairRemoteSplitAfterOfflineUndo ?? true) {
      this.splitHistory.repairAfterOfflineUndo();
    }

    this.doc.transact(() => {
      removeRedundantEmptyYjsTextNodes(this.root);
    }, this.canonicalizeOrigin);

    const children = readSlateValueFromYjs(this.root);

    this.traceEntries.push({
      importedChildren: children.length,
      importKind: 'full-read-replace',
      mode,
    });
    this.editorAdapter.replaceValue(
      children,
      this.awarenessAdapter.currentSelection()
    );
  }
}
