import {
  connectedFromYjsProviderStatus,
  isPromiseLike,
  normalizeYjsProviderStatus,
  normalizeYjsProviderSynced,
  readYjsProviderStatus,
  readYjsProviderSynced,
} from './provider';
import type {
  YjsProviderEvent,
  YjsProviderLike,
  YjsProviderStatus,
} from './types';

type YjsProviderLifecycleAdapterOptions = {
  readonly onConnectedChange: (connected: boolean) => void;
  readonly onProviderSyncedChange: () => void;
  readonly provider?: YjsProviderLike;
};

export type YjsProviderLifecycleAdapter = {
  readonly bind: () => void;
  readonly connect: () => unknown;
  readonly connected: () => boolean;
  readonly disconnect: () => unknown;
  readonly providerRevision: () => number;
  readonly providerStatus: () => YjsProviderStatus | null;
  readonly providerSynced: () => boolean | null;
  readonly reconnect: () => void;
  readonly subscribe: (listener: () => void) => () => void;
  readonly unbind: () => void;
};

const PROVIDER_SYNC_EVENTS = [
  'sync',
  'synced',
] as const satisfies readonly YjsProviderEvent[];

const notifySubscribers = (subscribers: ReadonlySet<() => void>): void => {
  if (subscribers.size === 0) {
    return;
  }

  for (const listener of subscribers) {
    listener();
  }
};

const isStaleConnectedProviderStatus = (
  status: YjsProviderStatus,
  fallbackConnected: boolean
): boolean => !fallbackConnected && status === 'connected';

export const createYjsProviderLifecycleAdapter = ({
  onConnectedChange,
  onProviderSyncedChange,
  provider,
}: YjsProviderLifecycleAdapterOptions): YjsProviderLifecycleAdapter => {
  const subscribers = new Set<() => void>();
  let providerRevision = 0;
  let providerStatusValue = readYjsProviderStatus(provider);
  let providerSyncedValue = readYjsProviderSynced(provider);
  let connected = connectedFromYjsProviderStatus(providerStatusValue, true);

  const updateProviderRevision = (): void => {
    providerRevision += 1;

    notifySubscribers(subscribers);
  };

  const setConnected = (nextConnected: boolean): boolean => {
    if (connected === nextConnected) {
      return false;
    }

    connected = nextConnected;
    onConnectedChange(connected);

    return true;
  };

  const updateConnectedFromProviderStatus = (
    status: YjsProviderStatus
  ): boolean => setConnected(connectedFromYjsProviderStatus(status, connected));

  const updateProviderStatus = (status: YjsProviderStatus): void => {
    const connectedChanged = updateConnectedFromProviderStatus(status);

    if (providerStatusValue === status) {
      if (connectedChanged) {
        updateProviderRevision();
      }

      return;
    }

    providerStatusValue = status;
    updateProviderRevision();
  };

  const updateProviderSynced = (synced: boolean): void => {
    if (providerSyncedValue === synced) {
      return;
    }

    providerSyncedValue = synced;
    onProviderSyncedChange();
    updateProviderRevision();
  };

  const providerStatusObserver = (payload: unknown): void => {
    const status = normalizeYjsProviderStatus(payload);

    if (status !== null) {
      if (
        providerStatusValue === status &&
        isStaleConnectedProviderStatus(status, connected)
      ) {
        return;
      }

      updateProviderStatus(status);
    }
  };

  const providerSyncedObserver = (payload: unknown): void => {
    const synced =
      normalizeYjsProviderSynced(payload) ?? readYjsProviderSynced(provider);

    if (synced !== null) {
      updateProviderSynced(synced);
    }
  };

  const syncProviderLifecycleStatus = (fallbackConnected: boolean): void => {
    const status = readYjsProviderStatus(provider);

    if (status !== null) {
      if (isStaleConnectedProviderStatus(status, fallbackConnected)) {
        return;
      }

      updateProviderStatus(status);

      return;
    }

    if (providerStatusValue === null) {
      const connectedChanged = setConnected(fallbackConnected);

      if (connectedChanged) {
        updateProviderRevision();
      }
    }
  };

  const syncProviderLifecycleResult = (
    result: Promise<unknown> | unknown,
    fallbackConnected: boolean
  ): void => {
    if (isPromiseLike(result)) {
      void result.then(
        () => {
          syncProviderLifecycleStatus(fallbackConnected);
        },
        () => undefined
      );

      return;
    }

    syncProviderLifecycleStatus(fallbackConnected);
  };

  const bind = (): void => {
    provider?.on?.('status', providerStatusObserver);
    let index = 0;

    while (index < PROVIDER_SYNC_EVENTS.length) {
      const event = PROVIDER_SYNC_EVENTS[index];

      provider?.on?.(event, providerSyncedObserver);
      index++;
    }
  };

  const unbind = (): void => {
    provider?.off?.('status', providerStatusObserver);
    let index = 0;

    while (index < PROVIDER_SYNC_EVENTS.length) {
      const event = PROVIDER_SYNC_EVENTS[index];

      provider?.off?.(event, providerSyncedObserver);
      index++;
    }
  };

  const connect = (): unknown => {
    if (provider !== undefined) {
      const result = provider.connect?.();

      syncProviderLifecycleResult(result, true);

      return result;
    }

    if (setConnected(true)) {
      updateProviderRevision();
    }
  };

  const disconnect = (): unknown => {
    if (provider !== undefined) {
      const providerStatusBefore = providerStatusValue;
      const providerSyncedBefore = providerSyncedValue;
      const connectedChanged = setConnected(false);
      const result = provider.disconnect?.();

      syncProviderLifecycleResult(result, false);

      if (
        connectedChanged &&
        providerStatusBefore === providerStatusValue &&
        providerSyncedBefore === providerSyncedValue
      ) {
        updateProviderRevision();
      }

      return result;
    }

    if (setConnected(false)) {
      updateProviderRevision();
    }
  };

  const reconnect = (): void => {
    const result = disconnect();

    if (isPromiseLike(result)) {
      void result.then(
        () => {
          connect();
        },
        () => undefined
      );

      return;
    }

    connect();
  };

  const subscribe = (listener: () => void): (() => void) => {
    subscribers.add(listener);

    return () => {
      subscribers.delete(listener);
    };
  };

  return {
    bind,
    connect,
    connected: () => connected,
    disconnect,
    providerRevision: () => providerRevision,
    providerStatus: () => providerStatusValue,
    providerSynced: () => providerSyncedValue,
    reconnect,
    subscribe,
    unbind,
  };
};
