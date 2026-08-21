import { areEditorJsonValuesEqual } from './editable/runtime-editor-api';
import type {
  PliteViewSourceErrorSink,
  PliteViewSourceOptions,
  PliteViewSourcePhase,
  PliteViewSourceStatus,
} from './view-source';

type Listener = () => void;

export const areMappedViewDataEqual = areEditorJsonValuesEqual;

type MappedViewStoreKernel<TSnapshot> = {
  countKeySubscribers: (keys: readonly string[]) => number;
  destroy: () => void;
  getSnapshot: () => TSnapshot;
  getSubscribedKeys: () => readonly string[];
  publish: (
    snapshot: TSnapshot,
    changedKeys: readonly string[]
  ) => Readonly<{ globalWakeCount: number; keyWakeCount: number }>;
  subscriberCount: () => number;
  subscribe: (listener: Listener) => () => void;
  subscribeKey: (key: string, listener: Listener) => () => void;
};

export const createMappedViewStoreKernel = <TSnapshot>(
  initialSnapshot: TSnapshot
): MappedViewStoreKernel<TSnapshot> => {
  const listeners = new Set<Listener>();
  const keyedListeners = new Map<string, Set<Listener>>();
  let destroyed = false;
  let snapshot = initialSnapshot;

  const subscribeKey = (key: string, listener: Listener) => {
    if (destroyed) return () => {};

    const listenersForKey = keyedListeners.get(key) ?? new Set<Listener>();
    listenersForKey.add(listener);
    keyedListeners.set(key, listenersForKey);

    return () => {
      listenersForKey.delete(listener);

      if (listenersForKey.size === 0) {
        keyedListeners.delete(key);
      }
    };
  };

  return {
    countKeySubscribers(keys) {
      return [...new Set(keys)].reduce(
        (count, key) => count + (keyedListeners.get(key)?.size ?? 0),
        0
      );
    },
    destroy() {
      if (destroyed) return;

      destroyed = true;
      listeners.clear();
      keyedListeners.clear();
    },
    getSnapshot() {
      return snapshot;
    },
    getSubscribedKeys() {
      return Object.freeze([...keyedListeners.keys()]);
    },
    publish(nextSnapshot, changedKeys) {
      if (destroyed) {
        return { globalWakeCount: 0, keyWakeCount: 0 };
      }

      const keys = [...new Set(changedKeys)];
      const globalWakeCount = listeners.size;
      const keyWakeCount = keys.reduce(
        (count, key) => count + (keyedListeners.get(key)?.size ?? 0),
        0
      );

      snapshot = nextSnapshot;
      listeners.forEach((listener) => {
        listener();
      });
      keys.forEach((key) => {
        keyedListeners.get(key)?.forEach((listener) => {
          listener();
        });
      });

      return { globalWakeCount, keyWakeCount };
    },
    subscriberCount() {
      return listeners.size;
    },
    subscribe(listener) {
      if (destroyed) return () => {};

      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    subscribeKey,
  };
};

type ViewSourceFaultBoundary = {
  activate: () => void;
  getStatus: () => PliteViewSourceStatus;
  run: <T>(
    phase: PliteViewSourcePhase,
    read: () => T
  ) => Readonly<{ ok: true; value: T }> | Readonly<{ ok: false }>;
};

const reportViewSourceError = (
  sourceId: string,
  phase: PliteViewSourcePhase,
  cause: unknown,
  onError?: PliteViewSourceErrorSink
) => {
  const error = Object.freeze({ cause, phase, sourceId });

  if (onError) {
    try {
      onError(error);
      return;
    } catch (sinkError) {
      console.error(
        `Plite view source "${sourceId}" error sink failed during ${phase}.`,
        cause,
        sinkError
      );
      return;
    }
  }

  console.error(
    `Plite view source "${sourceId}" failed during ${phase}.`,
    cause
  );
};

export const createViewSourceFaultBoundary = (
  options: PliteViewSourceOptions
): ViewSourceFaultBoundary => {
  let active = true;
  let failureCount = 0;

  return {
    activate() {
      active = true;
    },
    getStatus() {
      return Object.freeze({ active, failureCount });
    },
    run(phase, read) {
      if (!active) return { ok: false };

      try {
        return { ok: true, value: read() };
      } catch (cause) {
        active = false;
        failureCount += 1;
        reportViewSourceError(options.id, phase, cause, options.onError);

        return { ok: false };
      }
    },
  };
};
