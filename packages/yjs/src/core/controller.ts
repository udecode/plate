import type {
  Descendant,
  Editor,
  EditorCommit,
  EditorEffect,
  EditorSchemaIdentity,
  EditorSnapshot,
  EditorUpdateTransaction,
  JsonEditorValue,
  Value,
} from '@platejs/plite';
import { DocumentChange } from '@platejs/plite';
import {
  areEditorSchemaIdentitiesEqual,
  createEditorEffect,
  getCompiledEditorSchema,
  getCompiledPropertyMergeStrategy,
  getCollabEffects,
  getEditorExtensionRegistry,
  getInternalDocumentChangeRootKeys,
  MAIN_ROOT_KEY,
  scheduleAfterCommitNotification,
} from '@platejs/plite/internal';
import * as Y from 'yjs';

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
import {
  captureYjsEventBatch,
  type CapturedYjsEventBatch,
  mergeYjsEventBatches,
  YjsEventChangeBridge,
  type YjsEventImportFallback,
  type YjsEventNormalization,
} from './event-change-bridge';
import {
  createYjsProviderLifecycleAdapter,
  type YjsProviderLifecycleAdapter,
} from './provider-lifecycle-adapter';
import { isRecord } from './record';
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
  YjsRemoteCursorData,
  YjsState,
  YjsTraceEntry,
  YjsTx,
} from './types';

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
  private readonly autoSendSelection: boolean;
  private readonly awareness?: YjsAwarenessLike;
  private readonly awarenessAdapter: YjsAwarenessAdapter<TCursorData>;
  private readonly awarenessDataField: string;
  private readonly awarenessObserver: (event: YjsAwarenessChange) => void;
  private readonly awarenessSelectionField: string;
  private readonly awarenessSubscribers = new Set<() => void>();
  private readonly clientId: number | string;
  private readonly destroyProviderOnUnmount: boolean;
  private readonly doc: Y.Doc;
  private readonly editor: Editor;
  private readonly editorAdapter: YjsEditorAdapter;
  private readonly emptyValueFor: (root: string) => readonly Descendant[];
  private readonly canonicalizeOrigin = {};
  private readonly bindings = new Map<string, YjsRootBinding>();
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
  private readonly roots: Y.Map<Y.XmlElement>;
  private readonly rootsObserver: (
    events: Y.YEvent<Y.AbstractType<unknown>>[],
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
  private readonly seedProviderOnSync: boolean;
  private readonly traceEntries: YjsTraceEntry[] = [];

  private awarenessRevision = 0;
  private paused = false;
  private pendingRemoteEvents: CapturedYjsEventBatch | null = null;
  private pendingRemoteEffects = false;
  private readonly pendingRemoteNamedRoots = new Set<string>();
  private pendingRemoteRootChange = false;
  private pendingRemoteSchemaChange = false;
  private schemaError: Error | null = null;
  private seeded = false;
  private initialized = false;

  constructor(
    editor: Editor,
    options: YjsExtensionOptions,
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
    this.provider = options.provider;
    this.providerOwnedDoc =
      this.provider !== undefined &&
      (options.doc !== undefined || this.provider.doc !== undefined);
    this.doc = options.doc ?? this.provider?.doc ?? new Y.Doc();
    const rootName = options.rootName ?? '@platejs/plite';

    this.root = this.doc.get(rootName, Y.XmlElement);
    this.roots = this.doc.getMap(`${rootName}:roots`);
    this.schemaMetadata = this.doc.getMap(getYjsSchemaMetadataName(rootName));
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
    this.awarenessAdapter = createYjsAwarenessAdapter<TCursorData>({
      awareness: this.awareness,
      awarenessDataField: this.awarenessDataField,
      awarenessSelectionField: this.awarenessSelectionField,
      canSendSelection: () =>
        !this.shouldWaitForProviderSync() &&
        !this.shouldWaitForAppSeededProviderDoc(),
      clientId: this.clientId,
      doc: this.doc,
      editor: this.editor,
      isConnected: () => this.providerLifecycle.connected(),
      rootFor: (root) => this.rootFor(root),
      validateCursorData: options.cursorData?.validate ?? isRecord,
    });
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
    this.afterTransactionObserver = () => {
      if (!this.seeded) return;
      if (this.shouldWaitForProviderSync()) return;

      this.assertRoomSchemaForImport();

      this.flushRemoteTransaction();
      this.sharedEffectLog.settle();
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

    const schemaEnvelope = readYjsSchemaEnvelope(this.schemaMetadata);
    const isUnclaimedDocument = schemaEnvelope === null;

    for (const [root, binding] of this.bindings) {
      binding.synchronizedChildren =
        this.providerOwnedDoc || isUnclaimedDocument
          ? this.editorAdapter.readChildren(root)
          : this.readYjsRootValue(binding);
      binding.bridge.reset(binding.synchronizedChildren);
    }

    if (
      !this.providerOwnedDoc ||
      this.providerLifecycle.providerSynced() === true
    ) {
      this.assertRoomSchemaForImport();
    }

    this.schemaMetadata.observe(this.schemaObserver);
    this.root.observeDeep(this.observer);
    this.roots.observeDeep(this.rootsObserver);
    this.sharedEffectLog.observe(this.sharedEffectsObserver);
    this.doc.on('afterTransaction', this.afterTransactionObserver);

    try {
      this.bindExternalEvents();
      this.initialized = true;
    } catch (error) {
      this.unbindExternalEvents();
      this.schemaMetadata.unobserve(this.schemaObserver);
      this.root.unobserveDeep(this.observer);
      this.roots.unobserveDeep(this.rootsObserver);
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
      this.roots.unobserveDeep(this.rootsObserver);
      this.sharedEffectLog.unobserve(this.sharedEffectsObserver);
      this.doc.off('afterTransaction', this.afterTransactionObserver);
    }
    if (
      this.destroyProviderOnUnmount &&
      replacement?.provider !== this.provider
    ) {
      this.provider?.destroy?.();
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

  handleCommit(commit: EditorCommit, _snapshot: EditorSnapshot): void {
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

    let committedValue: ReturnType<YjsEditorAdapter['readValue']> | undefined;
    let previousCommittedValue:
      | ReturnType<YjsEditorAdapter['readValue']>
      | undefined;
    const changedRoots = new Set<string>();

    if (commit.changed.hasAny('document')) {
      committedValue = this.editorAdapter.readValue();
      previousCommittedValue = commit.inverseChanges.apply(committedValue);
      for (const root of getInternalDocumentChangeRootKeys(commit.changes)) {
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
      if (shouldSendSelection) {
        this.awarenessAdapter.sendSelection();
      }

      return;
    }

    if (this.shouldRejectUnsafeProviderCommit()) {
      scheduleAfterCommitNotification(this.editor, () => {
        const currentValue = this.editorAdapter.readValue();
        const previousValue = documentChanged
          ? commit.inverseChanges.apply(currentValue)
          : currentValue;

        try {
          this.editor.read.schema.assertDocument(previousValue);
        } catch {
          return;
        }

        this.editorAdapter.applyRemote({
          ...(documentChanged
            ? {
                change: DocumentChange.between(currentValue, previousValue),
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
        commit.inverseChanges.apply(this.editorAdapter.readValue())
      );
    }
    const preparedSharedEffects = this.sharedEffectLog.prepare(sharedEffects);

    if (!documentChanged) {
      this.doc.transact(() => {
        this.appendSharedEffects(preparedSharedEffects);
      }, this.localOrigin);

      if (shouldSendSelection) {
        this.awarenessAdapter.sendSelection();
      }

      return;
    }

    if (committedValue === undefined || previousCommittedValue === undefined) {
      throw new Error('Cannot synchronize a changed document without values.');
    }

    const after = committedValue;
    const before = previousCommittedValue;
    const removedBindings: string[] = [];
    const fallbacks = new Set<string>();

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
    if (shouldSendSelection) {
      this.awarenessAdapter.sendSelection();
    }
  }

  handleTransactionChange(tx: EditorUpdateTransaction<Value, any>): void {
    if (this.shouldRejectUnsafeProviderCommit()) {
      tx.tags.add('history-skip');
    }
  }

  assertSchemaIdentity(next: EditorSchemaIdentity): void {
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
    this.pendingRemoteNamedRoots.clear();
    this.pendingRemoteEffects = false;
    this.pendingRemoteSchemaChange = false;
    this.seeded = true;
    this.sharedEffectLog.settle();
  }

  private assertRoomSchemaForImport(): boolean {
    try {
      const envelope = readYjsSchemaEnvelope(this.schemaMetadata);

      if (envelope === null) {
        if (this.root.length === 0 && this.roots.size === 0) {
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

  private localSchemaIdentity(): EditorSchemaIdentity {
    return this.editor.read.schema.identity();
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

    this.pendingRemoteEvents = null;
    this.pendingRemoteRootChange = false;
    this.pendingRemoteNamedRoots.clear();
    this.pendingRemoteEffects = false;
    this.pendingRemoteSchemaChange = false;

    if (!rootChanged && namedRoots.size === 1 && events !== null) {
      this.importYjsEvents(events, pending.effects, [...namedRoots][0]!);
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
  }

  private shouldSkipCommit(
    commit: EditorCommit,
    hasSharedEffects: boolean,
    shouldSendSelection: boolean
  ): boolean {
    return (
      this.editorAdapter.importing() ||
      this.paused ||
      (!commit.changed.hasAny('document') &&
        !hasSharedEffects &&
        !shouldSendSelection) ||
      commit.tags.includes('skip-collab') ||
      commit.tags.includes('collaboration')
    );
  }

  state(): YjsState<TCursorData> {
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

  tx(): YjsTx<TCursorData> {
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

    this.importDocumentFromYjs('remote-reconcile', pending.effects);
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
    return (
      this.providerOwnedDoc && this.root.length === 0 && this.roots.size === 0
    );
  }

  private seedInitialValue(): void {
    this.seedValue(this.editorAdapter.readValue());
  }

  private seedValue(value: JsonEditorValue): void {
    this.doc.transact(() => {
      const envelope = readYjsSchemaEnvelope(this.schemaMetadata);
      const identity = this.localSchemaIdentity();

      if (envelope === null) {
        writeYjsSchemaEnvelope(this.schemaMetadata, identity);
      } else {
        assertYjsSchemaIdentity(identity, envelope.identity);
      }

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
    }, this.seedOrigin);
    this.resetBindingsFromYjs();
    this.traceEntries.push({ mode: 'seed' });
  }

  private seedInitialValueOrImportFromYjs(
    seedWhenEmpty: boolean,
    effects: readonly EditorEffect[] = []
  ): void {
    if (this.root.length === 0 && this.roots.size === 0) {
      if (seedWhenEmpty) {
        this.seedInitialValue();
      }
      if (effects.length > 0) {
        this.editorAdapter.applyRemote({ effects });
      }

      return;
    }

    this.importDocumentFromYjs('seed', effects);
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
    effects: readonly EditorEffect[] = [],
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
      selection: this.awarenessAdapter.currentSelection(),
    });
    binding.synchronizedChildren = children;
    binding.bridge.reset(children);
  }

  private importDocumentFromYjs(
    mode: YjsTraceEntry['mode'] = 'remote-reconcile',
    effects: readonly EditorEffect[] = [],
    changed?: Readonly<{
      main: boolean;
      named: ReadonlySet<string>;
    }>
  ): void {
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
      selection: this.awarenessAdapter.currentSelection(),
    });
    this.resetBindingsFromYjs({
      main: changed?.main ?? true,
      named: namedRoots,
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
      ...(before.roots ?? {}),
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
              ...(document.roots ?? {}),
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
    effects: readonly EditorEffect[],
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
      selection: this.awarenessAdapter.currentSelection(),
    });
    binding.synchronizedChildren = result.import.children;
    result.import.accept(binding.synchronizedChildren);
  }
}
