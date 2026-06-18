import * as Y from 'yjs';

import type {
  YjsAwarenessChange,
  YjsAwarenessLike,
  YjsAwarenessState,
  YjsProviderEvent,
  YjsProviderEventHandler,
  YjsProviderLike,
  YjsProviderStatus,
  YjsProviderStatusPayload,
  YjsProviderSyncedPayload,
} from '../../src/core/types';

type YjsProviderPayload = YjsProviderStatusPayload | YjsProviderSyncedPayload;
type YjsProviderPayloadHandler = (payload: YjsProviderPayload) => void;
type ProviderCall = 'connect' | 'destroy' | 'disconnect';

const toProviderPayloadHandler = (
  handler: YjsProviderEventHandler
): YjsProviderPayloadHandler => handler as YjsProviderPayloadHandler;

const emitProviderPayload = (
  listeners: ReadonlySet<YjsProviderPayloadHandler>,
  payload: YjsProviderPayload
): void => {
  for (const listener of listeners) {
    listener(payload);
  }
};

export class FakeAwareness implements YjsAwarenessLike {
  readonly clientID: number;
  readonly doc: { readonly clientID: number };

  private readonly listeners = new Set<(event: YjsAwarenessChange) => void>();
  private localState: YjsAwarenessState | null = null;
  private readonly states = new Map<number, YjsAwarenessState>();

  constructor(clientID: number) {
    this.clientID = clientID;
    this.doc = { clientID };
  }

  getLocalState(): YjsAwarenessState | null {
    return this.localState;
  }

  getStates(): ReadonlyMap<number, YjsAwarenessState> {
    return this.states;
  }

  off(_event: 'change', handler: (event: YjsAwarenessChange) => void): void {
    this.listeners.delete(handler);
  }

  on(_event: 'change', handler: (event: YjsAwarenessChange) => void): void {
    this.listeners.add(handler);
  }

  removeRemoteState(clientId: number): void {
    this.states.delete(clientId);
    this.emit({ added: [], removed: [clientId], updated: [] });
  }

  setLocalStateField(field: string, value: unknown): void {
    this.localState = {
      ...(this.localState ?? {}),
      [field]: value,
    };
    this.states.set(this.clientID, this.localState);
    this.emit({ added: [], removed: [], updated: [this.clientID] });
  }

  setRemoteState(clientId: number, state: YjsAwarenessState): void {
    const hasState = this.states.has(clientId);
    const added = hasState ? [] : [clientId];
    const updated = hasState ? [clientId] : [];

    this.states.set(clientId, state);
    this.emit({ added, removed: [], updated });
  }

  private emit(event: YjsAwarenessChange): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

export class FakeProvider implements YjsProviderLike {
  readonly awareness: FakeAwareness;
  readonly calls: ProviderCall[] = [];
  readonly doc?: Y.Doc;

  status: YjsProviderStatus;
  synced?: boolean;

  private readonly statusListeners = new Set<YjsProviderPayloadHandler>();
  private readonly syncedListeners = new Set<YjsProviderPayloadHandler>();
  private readonly syncListeners = new Set<YjsProviderPayloadHandler>();

  constructor({
    awarenessClientId = 12,
    doc = new Y.Doc(),
    exposeDoc = true,
    exposeSynced = true,
    status = 'disconnected',
    synced = false,
  }: {
    readonly awarenessClientId?: number;
    readonly doc?: Y.Doc;
    readonly exposeDoc?: boolean;
    readonly exposeSynced?: boolean;
    readonly status?: YjsProviderStatus;
    readonly synced?: boolean;
  } = {}) {
    this.awareness = new FakeAwareness(awarenessClientId);
    this.status = status;

    if (exposeDoc) {
      this.doc = doc;
    }
    if (exposeSynced) {
      this.synced = synced;
    }
  }

  connect(): void {
    this.calls.push('connect');
    this.emitStatus('connected');
  }

  destroy(): void {
    this.calls.push('destroy');
  }

  disconnect(): void {
    this.calls.push('disconnect');
    this.emitStatus('disconnected');
  }

  emitStatus(status: YjsProviderStatusPayload): void {
    this.status = typeof status === 'string' ? status : status.status;

    emitProviderPayload(this.statusListeners, status);
  }

  emitSynced(synced: boolean): void {
    this.synced = synced;

    emitProviderPayload(this.syncedListeners, synced);
  }

  emitSyncedState(synced: boolean): void {
    this.synced = synced;

    emitProviderPayload(this.syncedListeners, { state: synced });
  }

  emitSync(synced: boolean): void {
    this.synced = synced;

    emitProviderPayload(this.syncListeners, synced);
  }

  off(event: YjsProviderEvent, handler: YjsProviderEventHandler): void {
    this.listenersFor(event).delete(toProviderPayloadHandler(handler));
  }

  on(event: YjsProviderEvent, handler: YjsProviderEventHandler): void {
    this.listenersFor(event).add(toProviderPayloadHandler(handler));
  }

  private listenersFor(
    event: YjsProviderEvent
  ): Set<YjsProviderPayloadHandler> {
    if (event === 'status') {
      return this.statusListeners;
    }
    if (event === 'sync') {
      return this.syncListeners;
    }

    return this.syncedListeners;
  }
}
