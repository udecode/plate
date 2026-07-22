import { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import type {
  Editor,
  EditorCommit,
  EditorStateView,
  ExtensionsOf,
  RuntimeId,
  ValueOf,
} from '@platejs/plite';
import { recordPliteReactRender } from '../render-profiler';
import { useEditor } from './use-editor';
import { useGenericSelector } from './use-generic-selector';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

type Callback = (change?: EditorCommit) => void;

type DeferredCallbackPayload = {
  change?: EditorCommit;
};

export type EditorSelectorContextValue = {
  addEventListener: (
    callback: Callback,
    options?: EditorSelectorOptions
  ) => () => void;
  flushDeferred: () => void;
};

/** Commit-subscription options for selectors that read from the editor. */
export interface EditorSelectorOptions<
  TEditor extends Editor<any, any> = Editor<any, any>,
> {
  deferred?: boolean;
  includeRootOrderChanges?: boolean;
  profileId?: string;
  runtimeEventSource?: 'node' | 'path' | 'render';
  runtimeId?: RuntimeId | null;
  runtimeIds?: readonly RuntimeId[] | null;
  shouldUpdate?: (change?: EditorCommit<ValueOf<TEditor>>) => boolean;
}

/** Options for selectors that read from the immutable editor state view. */
export interface EditorStateSelectorOptions<
  T,
  TEditor extends Editor<any, any> = Editor<any, any>,
> {
  deferred?: boolean;
  deps?: readonly unknown[];
  equalityFn?: (a: T | null, b: T) => boolean;
  shouldUpdate?: (change?: EditorCommit<ValueOf<TEditor>>) => boolean;
}

export const EditorSelectorContext =
  createContext<EditorSelectorContextValue | null>(null);

const refEquality = <T,>(a: T | null, b: T) => a === b;

const getSelectorProfileId = (
  profileId: string | undefined,
  runtimeId: RuntimeId | null | undefined,
  phase: 'check' | 'notify'
) => `selector-${profileId ?? (runtimeId ? 'runtime' : 'global')}-${phase}`;

const scheduleMicrotask =
  typeof queueMicrotask === 'function'
    ? queueMicrotask
    : (callback: () => void) => {
        Promise.resolve().then(callback);
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
 * Scope updates with roots/runtime ids or `shouldUpdate`, and use
 * `useEditorState` when the selector only needs the immutable state view.
 */
export function useEditorSelector<
  T,
  TEditor extends Editor<any, any> = Editor<any, any>,
>(
  selector: (editor: TEditor) => T,
  equalityFn: (a: T | null, b: T) => boolean = refEquality,
  {
    deferred,
    includeRootOrderChanges,
    profileId,
    runtimeEventSource,
    runtimeId,
    runtimeIds,
    shouldUpdate,
  }: EditorSelectorOptions<TEditor> = {}
): T {
  const { addEventListener } = useRequiredEditorSelectorContext();

  const editor = useEditor<TEditor>();
  const genericSelector = useCallback(
    () => selector(editor),
    [editor, selector]
  );
  const [selectedState, update] = useGenericSelector(
    genericSelector,
    equalityFn
  );
  const updateFromCommit = useCallback(() => update(), [update]);
  const shouldUpdateWithEditor = useCallback(
    (change?: EditorCommit) =>
      shouldUpdate
        ? shouldUpdate(change as EditorCommit<ValueOf<TEditor>> | undefined)
        : true,
    [shouldUpdate]
  );

  useIsomorphicLayoutEffect(() => {
    const unsubscribe = addEventListener(updateFromCommit, {
      deferred,
      includeRootOrderChanges,
      profileId,
      runtimeEventSource,
      runtimeId,
      runtimeIds,
      shouldUpdate: shouldUpdate ? shouldUpdateWithEditor : undefined,
    });
    update();
    return unsubscribe;
  }, [
    addEventListener,
    update,
    updateFromCommit,
    deferred,
    profileId,
    runtimeEventSource,
    runtimeId,
    runtimeIds,
    includeRootOrderChanges,
    shouldUpdate,
    shouldUpdateWithEditor,
  ]);

  return selectedState;
}

/**
 * Reads from the immutable editor state view and re-renders only when the
 * selected value changes.
 *
 * Pass `deps` when the selector closes over changing values.
 */
export function useEditorState<
  T,
  TEditor extends Editor<any, any> = Editor<any, any>,
>(
  selector: (
    state: EditorStateView<ValueOf<TEditor>, ExtensionsOf<TEditor>>
  ) => T,
  {
    deferred,
    deps,
    equalityFn = refEquality,
    shouldUpdate,
  }: EditorStateSelectorOptions<T, TEditor> = {}
): T {
  const selectorDeps = deps ?? [selector];
  const stateSelector = useCallback(
    (editor: TEditor) =>
      editor.read((state) =>
        selector(
          state as EditorStateView<ValueOf<TEditor>, ExtensionsOf<TEditor>>
        )
      ),
    // `deps` intentionally owns inline selector closure freshness.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    selectorDeps
  );
  const shouldUpdateWithChange = useCallback(
    (change?: EditorCommit) =>
      shouldUpdate
        ? shouldUpdate(change as EditorCommit<ValueOf<TEditor>> | undefined)
        : true,
    [shouldUpdate]
  );

  return useEditorSelector<T, TEditor>(stateSelector, equalityFn, {
    deferred,
    shouldUpdate: shouldUpdate ? shouldUpdateWithChange : undefined,
  });
}

export function useEditorSelectorContext() {
  const eventListeners = useRef(new Set<Callback>());
  const runtimeEventListeners = useRef(new Map<RuntimeId, Set<Callback>>());
  const runtimePathEventListeners = useRef(new Map<RuntimeId, Set<Callback>>());
  const runtimeRenderEventListeners = useRef(
    new Map<RuntimeId, Set<Callback>>()
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
    (
      change?: EditorCommit,
      invalidatedRuntimeIds: readonly RuntimeId[] = []
    ) => {
      eventListeners.current.forEach((listener) => {
        listener(change);
      });

      const shouldRouteRootOrderRuntimeListeners = Boolean(
        change?.changed.hasAny('root-order')
      );
      const affectedRuntimeIds = change?.changed.runtimeIdsAll('node') ?? [];
      const affectedPathRuntimeIds =
        change?.changed.runtimeIdsAll('path') ?? [];
      const syncedTextOnlyChange = Boolean(
        change?.changed.hasAny('text') &&
          !change.tags.includes('historic') &&
          !change.changed.hasAny('structure') &&
          !change.changed.hasAny('properties')
      );
      const shouldRouteRenderRuntimeListeners = Boolean(
        !change || !syncedTextOnlyChange
      );
      const runtimeCallbacks = new Set<Callback>();
      const invalidatedRuntimeCallbacks = new Set<Callback>();

      if (!change) {
        runtimeEventListeners.current.forEach((listeners) => {
          listeners.forEach((listener) => {
            runtimeCallbacks.add(listener);
          });
        });
      } else {
        for (const runtimeId of new Set([
          ...affectedRuntimeIds,
          ...affectedPathRuntimeIds,
        ])) {
          runtimeEventListeners.current.get(runtimeId)?.forEach((listener) => {
            runtimeCallbacks.add(listener);
          });
        }
      }
      if (!change) {
        runtimePathEventListeners.current.forEach((listeners) => {
          listeners.forEach((listener) => {
            runtimeCallbacks.add(listener);
          });
        });
      } else {
        for (const runtimeId of affectedPathRuntimeIds) {
          runtimePathEventListeners.current
            .get(runtimeId)
            ?.forEach((listener) => {
              runtimeCallbacks.add(listener);
            });
        }
      }
      if (shouldRouteRenderRuntimeListeners) {
        if (!change) {
          runtimeRenderEventListeners.current.forEach((listeners) => {
            listeners.forEach((listener) => {
              runtimeCallbacks.add(listener);
            });
          });
        } else {
          for (const runtimeId of affectedRuntimeIds) {
            runtimeRenderEventListeners.current
              .get(runtimeId)
              ?.forEach((listener) => {
                runtimeCallbacks.add(listener);
              });
          }
        }
      }
      for (const runtimeId of invalidatedRuntimeIds) {
        runtimeEventListeners.current.get(runtimeId)?.forEach((listener) => {
          runtimeCallbacks.add(listener);
          invalidatedRuntimeCallbacks.add(listener);
        });
        runtimeRenderEventListeners.current
          .get(runtimeId)
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
        runtimeId = null,
        runtimeIds = null,
        shouldUpdate,
      }: EditorSelectorOptions = {}
    ) => {
      const subscribedRuntimeIds =
        runtimeIds && runtimeIds.length > 0
          ? Array.from(new Set(runtimeIds))
          : runtimeId
            ? [runtimeId]
            : null;
      const profileRuntimeId =
        subscribedRuntimeIds?.length === 1
          ? subscribedRuntimeIds[0]
          : runtimeId;
      const shouldNotify = (change?: EditorCommit) => {
        recordPliteReactRender({
          id: getSelectorProfileId(profileId, profileRuntimeId, 'check'),
          kind: 'selector',
          runtimeId: profileRuntimeId,
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
                id: getSelectorProfileId(profileId, profileRuntimeId, 'notify'),
                kind: 'selector',
                runtimeId: profileRuntimeId,
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
                id: getSelectorProfileId(profileId, profileRuntimeId, 'notify'),
                kind: 'selector',
                runtimeId: profileRuntimeId,
              });
              callbackProp(change);
            }
          };

      recordPliteReactRender({
        id: subscribedRuntimeIds
          ? 'selector-subscription-runtime'
          : deferred
            ? 'selector-subscription-deferred'
            : 'selector-subscription-global',
        kind: 'selector',
        runtimeId: profileRuntimeId,
      });

      if (subscribedRuntimeIds) {
        const listenerMap =
          runtimeEventSource === 'path'
            ? runtimePathEventListeners.current
            : runtimeEventSource === 'render'
              ? runtimeRenderEventListeners.current
              : runtimeEventListeners.current;
        const listenerSets: Set<Callback>[] = [];

        subscribedRuntimeIds.forEach((subscribedRuntimeId) => {
          const listeners =
            listenerMap.get(subscribedRuntimeId) ?? new Set<Callback>();

          listeners.add(callback);
          listenerMap.set(subscribedRuntimeId, listeners);
          listenerSets.push(listeners);
        });

        if (includeRootOrderChanges) {
          rootOrderRuntimeEventListeners.current.add(callback);
        }

        return () => {
          isSubscribed = false;
          deferredEventListeners.current.delete(queuedCallback);
          subscribedRuntimeIds.forEach((subscribedRuntimeId, index) => {
            const listeners = listenerSets[index];

            listeners.delete(callback);

            if (listeners.size === 0) {
              listenerMap.delete(subscribedRuntimeId);
            }
          });
          rootOrderRuntimeEventListeners.current.delete(callback);
        };
      }

      eventListeners.current.add(callback);

      return () => {
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
