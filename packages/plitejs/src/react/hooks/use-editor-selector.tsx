import { createContext, useCallback, useContext, useMemo, useRef } from 'react';

import type {
  EditorCommit,
  EditorStateView,
  PluginsOf,
  NodeKey,
  ValueOf,
} from '../..';
import type { EditorContextValue } from '../plugin/with-react';
import { recordPliteReactRender } from '../render-profiler';
import { useEditorContext } from './use-editor-context';
import { useGenericSelector } from './use-generic-selector';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

type Callback = (change?: EditorCommit) => void;

type DeferredCallbackPayload = {
  change?: EditorCommit;
};

type ContextEditor = EditorContextValue<any>;

export type EditorSelectorContextValue = {
  addEventListener: (
    callback: Callback,
    options?: EditorSelectorOptions
  ) => () => void;
  flushDeferred: () => void;
};

/** Commit-subscription options for selectors that read from the editor. */
export interface EditorSelectorOptions<T = unknown> {
  deferred?: boolean;
  equalityFn?: (a: T | null, b: T) => boolean;
  includeRootOrderChanges?: boolean;
  profileId?: string;
  runtimeEventSource?: 'node' | 'path' | 'render' | 'selection';
  nodeKey?: NodeKey | null;
  nodeKeys?: readonly NodeKey[] | null;
  shouldUpdate?: (change?: EditorCommit) => boolean;
}

/** Options for selectors that read from the immutable editor state view. */
export interface EditorStateSelectorOptions<T> {
  deferred?: boolean;
  equalityFn?: (a: T | null, b: T) => boolean;
  shouldUpdate?: (change?: EditorCommit) => boolean;
}

export const EditorSelectorContext =
  createContext<EditorSelectorContextValue | null>(null);

const refEquality = <T,>(a: T | null, b: T) => a === b;

const getSelectorProfileId = (
  profileId: string | undefined,
  nodeKey: NodeKey | null | undefined,
  phase: 'check' | 'notify'
) => `selector-${profileId ?? (nodeKey ? 'runtime' : 'global')}-${phase}`;

const scheduleMicrotask =
  typeof queueMicrotask === 'function'
    ? queueMicrotask
    : (callback: () => void) => {
        void Promise.resolve().then(callback);
      };

const queueDeferredCallback = (
  queue: Map<Callback, DeferredCallbackPayload>,
  callback: Callback,
  change?: EditorCommit
) => {
  const existing = queue.get(callback);

  queue.set(callback, {
    change: change ?? existing?.change,
  });
};

export function useRequiredEditorSelectorContext() {
  const context = useContext(EditorSelectorContext);
  if (!context) {
    throw new Error(
      `The \`useEditorSelector\` hook must be used inside the <Plite> component's context.`
    );
  }

  return context;
}

/**
 * Subscribe to editor commits and derive a render value from the editor.
 *
 * Scope updates with roots/node keys or `shouldUpdate`, and use
 * `useEditorState` when the selector only needs the immutable state view.
 */
export function useEditorSelector<T>(
  selector: (editor: ContextEditor) => T,
  {
    deferred,
    equalityFn = refEquality,
    includeRootOrderChanges,
    profileId,
    runtimeEventSource,
    nodeKey,
    nodeKeys,
    shouldUpdate,
  }: EditorSelectorOptions<T> = {}
): T {
  const { addEventListener } = useRequiredEditorSelectorContext();

  const editor = useEditorContext();
  const genericSelector = useCallback(
    () => selector(editor),
    [editor, selector]
  );
  const [selectedState, update] = useGenericSelector(
    genericSelector,
    equalityFn
  );
  const updateFromCommit = useCallback(() => {
    update();
  }, [update]);
  const shouldUpdateRef = useRef(shouldUpdate);

  useIsomorphicLayoutEffect(() => {
    const changed = shouldUpdateRef.current !== shouldUpdate;

    shouldUpdateRef.current = shouldUpdate;

    if (changed) update();
  }, [shouldUpdate, update]);

  const shouldUpdateWithEditor = useCallback(
    (change?: EditorCommit) => shouldUpdateRef.current?.(change) ?? true,
    []
  );

  useIsomorphicLayoutEffect(() => {
    const unsubscribe = addEventListener(updateFromCommit, {
      deferred,
      includeRootOrderChanges,
      profileId,
      runtimeEventSource,
      nodeKey,
      nodeKeys,
      shouldUpdate: shouldUpdateWithEditor,
    });
    update();
    return unsubscribe;
  }, [
    addEventListener,
    deferred,
    editor,
    includeRootOrderChanges,
    nodeKey,
    nodeKeys,
    profileId,
    runtimeEventSource,
    shouldUpdateWithEditor,
    update,
    updateFromCommit,
  ]);

  return selectedState;
}

/**
 * Reads from the immutable editor state view and re-renders only when the
 * selected value changes.
 *
 * Inline selectors always observe the latest render values.
 */
export function useEditorState<T>(
  selector: (
    state: EditorStateView<ValueOf<ContextEditor>, PluginsOf<ContextEditor>>
  ) => T,
  {
    deferred,
    equalityFn = refEquality,
    shouldUpdate,
  }: EditorStateSelectorOptions<T> = {}
): T {
  const stateSelector = useCallback(
    (editor: ContextEditor) => editor.read((state) => selector(state)),
    [selector]
  );

  return useEditorSelector<T>(stateSelector, {
    deferred,
    equalityFn,
    shouldUpdate,
  });
}

export function useEditorSelectorContext() {
  const eventListeners = useRef(new Set<Callback>());
  const runtimeEventListeners = useRef(new Map<NodeKey, Set<Callback>>());
  const runtimePathEventListeners = useRef(new Map<NodeKey, Set<Callback>>());
  const runtimeRenderEventListeners = useRef(new Map<NodeKey, Set<Callback>>());
  const runtimeSelectionEventListeners = useRef(
    new Map<NodeKey, Set<Callback>>()
  );
  const rootOrderRuntimeEventListeners = useRef(new Set<Callback>());
  const deferredEventListeners = useRef(
    new Map<Callback, DeferredCallbackPayload>()
  );
  const deferredFlushScheduled = useRef(false);

  const flushDeferred = useCallback(() => {
    deferredFlushScheduled.current = false;
    deferredEventListeners.current.forEach((payload, listener) => {
      listener(payload.change);
    });
    deferredEventListeners.current.clear();
  }, []);

  const scheduleDeferredFlush = useCallback(() => {
    if (deferredFlushScheduled.current) {
      return;
    }

    deferredFlushScheduled.current = true;
    scheduleMicrotask(flushDeferred);
  }, [flushDeferred]);

  const onChange = useCallback(
    (change?: EditorCommit, invalidatedNodeKeys: readonly NodeKey[] = []) => {
      eventListeners.current.forEach((listener) => {
        listener(change);
      });

      const shouldRouteRootOrderRuntimeListeners = Boolean(
        rootOrderRuntimeEventListeners.current.size &&
        change?.changed.hasAny('root-order')
      );
      const runtimeCallbacks = new Set<Callback>();
      const invalidatedRuntimeCallbacks = new Set<Callback>();
      const collect = (
        listeners: Map<NodeKey, Set<Callback>>,
        keys: readonly NodeKey[]
      ) => {
        for (const key of keys) {
          listeners
            .get(key)
            ?.forEach((listener) => runtimeCallbacks.add(listener));
        }
      };

      if (!change) {
        for (const map of [
          runtimeEventListeners.current,
          runtimePathEventListeners.current,
          runtimeRenderEventListeners.current,
          runtimeSelectionEventListeners.current,
        ]) {
          map.forEach((listeners) => {
            listeners.forEach((listener) => runtimeCallbacks.add(listener));
          });
        }
      } else {
        const nodes = runtimeEventListeners.current;
        const paths = runtimePathEventListeners.current;
        const renders = runtimeRenderEventListeners.current;
        const selections = runtimeSelectionEventListeners.current;
        const syncedTextOnlyChange =
          renders.size > 0 &&
          change.changed.hasAny('text') &&
          !change.tags.includes('historic') &&
          !change.changed.hasAny('structure') &&
          !change.changed.hasAny('properties');

        if (nodes.size || (renders.size && !syncedTextOnlyChange)) {
          const keys = change.changed.nodeKeysAll('node');
          collect(nodes, keys);
          if (!syncedTextOnlyChange) collect(renders, keys);
        }
        if (nodes.size || selections.size) {
          const keys = change.changed.nodeKeysAll('selection');
          collect(nodes, keys);
          collect(selections, keys);
        }
        if ((nodes.size || paths.size) && change.changed.hasAny('structure')) {
          for (const map of [nodes, paths]) {
            for (const [key, listeners] of map) {
              if (change.changed.hasNodeKey(key, 'path')) {
                listeners.forEach((listener) => runtimeCallbacks.add(listener));
              }
            }
          }
        }
      }
      for (const nodeKey of invalidatedNodeKeys) {
        runtimeEventListeners.current.get(nodeKey)?.forEach((listener) => {
          runtimeCallbacks.add(listener);
          invalidatedRuntimeCallbacks.add(listener);
        });
        runtimeRenderEventListeners.current
          .get(nodeKey)
          ?.forEach((listener) => {
            runtimeCallbacks.add(listener);
            invalidatedRuntimeCallbacks.add(listener);
          });
      }
      if (shouldRouteRootOrderRuntimeListeners) {
        rootOrderRuntimeEventListeners.current.forEach((listener) => {
          runtimeCallbacks.add(listener);
        });
      }

      runtimeCallbacks.forEach((listener) => {
        listener(
          invalidatedRuntimeCallbacks.has(listener) ? undefined : change
        );
      });

      if (deferredEventListeners.current.size > 0) {
        scheduleDeferredFlush();
      }
    },
    [scheduleDeferredFlush]
  );

  const addEventListener = useCallback(
    (
      callbackProp: Callback,
      {
        deferred = false,
        includeRootOrderChanges = false,
        profileId,
        runtimeEventSource = 'node',
        nodeKey = null,
        nodeKeys = null,
        shouldUpdate,
      }: EditorSelectorOptions = {}
    ) => {
      const subscribedNodeKeys =
        nodeKeys && nodeKeys.length > 0
          ? [...new Set(nodeKeys)]
          : nodeKey
            ? [nodeKey]
            : null;
      const profileNodeKey =
        subscribedNodeKeys?.length === 1 ? subscribedNodeKeys[0] : nodeKey;
      const shouldNotify = (change?: EditorCommit) => {
        recordPliteReactRender({
          id: getSelectorProfileId(profileId, profileNodeKey, 'check'),
          kind: 'selector',
          nodeKey: profileNodeKey,
        });

        return shouldUpdate ? shouldUpdate(change) : true;
      };
      let isSubscribed = true;
      const queuedCallback = deferred
        ? (change?: EditorCommit) => {
            if (isSubscribed) {
              callbackProp(change);
            }
          }
        : callbackProp;
      const callback = deferred
        ? (change?: EditorCommit) => {
            if (shouldNotify(change)) {
              recordPliteReactRender({
                id: getSelectorProfileId(profileId, profileNodeKey, 'notify'),
                kind: 'selector',
                nodeKey: profileNodeKey,
              });
              queueDeferredCallback(
                deferredEventListeners.current,
                queuedCallback,
                change
              );
            }
          }
        : (change?: EditorCommit) => {
            if (shouldNotify(change)) {
              recordPliteReactRender({
                id: getSelectorProfileId(profileId, profileNodeKey, 'notify'),
                kind: 'selector',
                nodeKey: profileNodeKey,
              });
              callbackProp(change);
            }
          };

      recordPliteReactRender({
        id: subscribedNodeKeys
          ? 'selector-subscription-runtime'
          : deferred
            ? 'selector-subscription-deferred'
            : 'selector-subscription-global',
        kind: 'selector',
        nodeKey: profileNodeKey,
      });

      if (subscribedNodeKeys) {
        const listenerMap =
          runtimeEventSource === 'path'
            ? runtimePathEventListeners.current
            : runtimeEventSource === 'render'
              ? runtimeRenderEventListeners.current
              : runtimeEventSource === 'selection'
                ? runtimeSelectionEventListeners.current
                : runtimeEventListeners.current;
        const listenerSets: Array<Set<Callback>> = [];

        subscribedNodeKeys.forEach((subscribedNodeKey) => {
          const listeners =
            listenerMap.get(subscribedNodeKey) ?? new Set<Callback>();

          listeners.add(callback);
          listenerMap.set(subscribedNodeKey, listeners);
          listenerSets.push(listeners);
        });

        if (includeRootOrderChanges) {
          rootOrderRuntimeEventListeners.current.add(callback);
        }

        return () => {
          if (!isSubscribed) return;
          isSubscribed = false;
          deferredEventListeners.current.delete(queuedCallback);
          subscribedNodeKeys.forEach((subscribedNodeKey, index) => {
            const listeners = listenerSets[index];

            listeners.delete(callback);

            if (listeners.size === 0) {
              listenerMap.delete(subscribedNodeKey);
            }
          });
          rootOrderRuntimeEventListeners.current.delete(callback);
        };
      }

      eventListeners.current.add(callback);

      return () => {
        if (!isSubscribed) return;
        isSubscribed = false;
        deferredEventListeners.current.delete(queuedCallback);
        eventListeners.current.delete(callback);
      };
    },
    []
  );

  const selectorContext = useMemo(
    () => ({
      addEventListener,
      flushDeferred,
    }),
    [addEventListener, flushDeferred]
  );

  return { selectorContext, onChange };
}

export function useFlushDeferredSelectorsOnRender() {
  const { flushDeferred } = useRequiredEditorSelectorContext();
  useIsomorphicLayoutEffect(flushDeferred);
}
