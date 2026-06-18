import { createContext, useCallback, useContext, useMemo, useRef } from 'react';
import type {
  Editor,
  EditorCommit,
  EditorStateView,
  Operation,
  RuntimeId,
  ValueOf,
} from '@platejs/slate';
import { recordSlateReactRender } from '../render-profiler';
import { useEditor } from './use-editor';
import { useGenericSelector } from './use-generic-selector';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

type Callback = (
  operations?: readonly Operation[],
  change?: EditorCommit
) => void;

type DeferredCallbackPayload = {
  change?: EditorCommit;
  operations?: readonly Operation[];
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
  TEditor extends Editor<any> = Editor<any>,
> {
  deferred?: boolean;
  includeRootOrderChanges?: boolean;
  profileId?: string;
  runtimeEventSource?: 'node' | 'path' | 'render';
  runtimeId?: RuntimeId | null;
  runtimeIds?: readonly RuntimeId[] | null;
  shouldUpdate?: (
    operations?: readonly Operation<ValueOf<TEditor>>[],
    change?: EditorCommit<ValueOf<TEditor>>
  ) => boolean;
}

/** Options for selectors that read from the immutable editor state view. */
export interface EditorStateSelectorOptions<
  T,
  TEditor extends Editor<any> = Editor<any>,
> {
  deferred?: boolean;
  deps?: readonly unknown[];
  equalityFn?: (a: T | null, b: T) => boolean;
  shouldUpdate?: (
    change?: EditorCommit<ValueOf<TEditor>>,
    operations?: readonly Operation<ValueOf<TEditor>>[]
  ) => boolean;
}

export const EditorSelectorContext =
  createContext<EditorSelectorContextValue | null>(null);

const refEquality = <T,>(a: T | null, b: T) => a === b;

const getSelectorProfileId = (
  profileId: string | undefined,
  runtimeId: RuntimeId | null | undefined,
  phase: 'check' | 'notify'
) => `selector-${profileId ?? (runtimeId ? 'runtime' : 'global')}-${phase}`;

const isTextRenderOperation = (operation: Operation) =>
  operation.type === 'insert_text' ||
  operation.type === 'remove_text' ||
  operation.type === 'set_selection';

const scheduleMicrotask =
  typeof queueMicrotask === 'function'
    ? queueMicrotask
    : (callback: () => void) => {
        Promise.resolve().then(callback);
      };

const queueDeferredCallback = (
  queue: Map<Callback, DeferredCallbackPayload>,
  callback: Callback,
  operations?: readonly Operation[],
  change?: EditorCommit
) => {
  const existing = queue.get(callback);

  queue.set(callback, {
    change,
    operations:
      existing?.operations && operations
        ? [...existing.operations, ...operations]
        : (operations ?? existing?.operations),
  });
};

export function useRequiredEditorSelectorContext() {
  const context = useContext(EditorSelectorContext);
  if (!context) {
    throw new Error(
      `The \`useEditorSelector\` hook must be used inside the <Slate> component's context.`
    );
  }

  return context;
}

/**
 * Subscribe to editor commits and derive a render value from the editor.
 *
 * The selector receives the operations for the triggering commit. Scope updates
 * with roots/runtime ids or `shouldUpdate`, and use `useEditorState` when the
 * selector only needs the immutable state view.
 */
export function useEditorSelector<T, TEditor extends Editor<any> = Editor<any>>(
  selector: (
    editor: TEditor,
    operations?: readonly Operation<ValueOf<TEditor>>[]
  ) => T,
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
  const latestOperations = useRef<readonly Operation[] | undefined>(undefined);
  const genericSelector = useCallback(
    () =>
      selector(
        editor,
        latestOperations.current as
          | readonly Operation<ValueOf<TEditor>>[]
          | undefined
      ),
    [editor, selector]
  );
  const [selectedState, update] = useGenericSelector(
    genericSelector,
    equalityFn
  );
  const updateWithOperations = useCallback(
    (operations?: readonly Operation[]) => {
      latestOperations.current = operations;
      try {
        update();
      } finally {
        latestOperations.current = undefined;
      }
    },
    [update]
  );
  const shouldUpdateWithEditor = useCallback(
    (operations?: readonly Operation[], change?: EditorCommit) =>
      shouldUpdate
        ? shouldUpdate(
            operations as readonly Operation<ValueOf<TEditor>>[] | undefined,
            change as EditorCommit<ValueOf<TEditor>> | undefined
          )
        : true,
    [shouldUpdate]
  );

  useIsomorphicLayoutEffect(() => {
    const unsubscribe = addEventListener(updateWithOperations, {
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
    updateWithOperations,
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
export function useEditorState<T, TEditor extends Editor<any> = Editor<any>>(
  selector: (state: EditorStateView<ValueOf<TEditor>>) => T,
  {
    deferred,
    deps,
    equalityFn = refEquality,
    shouldUpdate,
  }: EditorStateSelectorOptions<T, TEditor> = {}
): T {
  const selectorDeps = deps ?? [selector];
  const stateSelector = useCallback(
    (editor: TEditor) => editor.read((state) => selector(state)),
    // `deps` intentionally owns inline selector closure freshness.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    selectorDeps
  );
  const shouldUpdateWithChange = useCallback(
    (operations?: readonly Operation[], change?: EditorCommit) =>
      shouldUpdate
        ? shouldUpdate(
            change as EditorCommit<ValueOf<TEditor>> | undefined,
            operations as readonly Operation<ValueOf<TEditor>>[] | undefined
          )
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
      listener(payload.operations, payload.change);
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
    (operations?: readonly Operation[], change?: EditorCommit) => {
      eventListeners.current.forEach((listener) => {
        listener(operations, change);
      });

      const shouldRouteRootOrderRuntimeListeners = Boolean(
        change &&
          (change.fullDocumentChanged ||
            change.rootRuntimeIdsChanged ||
            change.structureChanged ||
            change.topLevelOrderChanged)
      );
      const affectedRuntimeIds = change?.fullDocumentChanged
        ? change.affectedNodeRuntimeIds
        : change?.nodeImpactRuntimeIds;
      const shouldRoutePathRuntimeListeners = Boolean(
        !change ||
          change.fullDocumentChanged ||
          change.rootRuntimeIdsChanged ||
          change.structureChanged ||
          change.topLevelOrderChanged
      );
      const syncedTextOnlyChange = Boolean(
        change?.textChanged &&
          operations &&
          operations.length > 0 &&
          operations.every(isTextRenderOperation)
      );
      const shouldRouteRenderRuntimeListeners = Boolean(
        !change || !syncedTextOnlyChange
      );
      const runtimeCallbacks = new Set<Callback>();

      if (!change || affectedRuntimeIds == null) {
        runtimeEventListeners.current.forEach((listeners) => {
          listeners.forEach((listener) => {
            runtimeCallbacks.add(listener);
          });
        });
      } else {
        for (const runtimeId of affectedRuntimeIds) {
          runtimeEventListeners.current.get(runtimeId)?.forEach((listener) => {
            runtimeCallbacks.add(listener);
          });
        }
      }
      if (shouldRoutePathRuntimeListeners) {
        if (!change || affectedRuntimeIds == null) {
          runtimePathEventListeners.current.forEach((listeners) => {
            listeners.forEach((listener) => {
              runtimeCallbacks.add(listener);
            });
          });
        } else {
          for (const runtimeId of affectedRuntimeIds) {
            runtimePathEventListeners.current
              .get(runtimeId)
              ?.forEach((listener) => {
                runtimeCallbacks.add(listener);
              });
          }
        }
      }
      if (shouldRouteRenderRuntimeListeners) {
        if (!change || affectedRuntimeIds == null) {
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
      if (shouldRouteRootOrderRuntimeListeners) {
        rootOrderRuntimeEventListeners.current.forEach((listener) => {
          runtimeCallbacks.add(listener);
        });
      }

      runtimeCallbacks.forEach((listener) => {
        listener(operations, change);
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
      const shouldNotify = (
        operations?: readonly Operation[],
        change?: EditorCommit
      ) => {
        recordSlateReactRender({
          id: getSelectorProfileId(profileId, profileRuntimeId, 'check'),
          kind: 'selector',
          runtimeId: profileRuntimeId,
        });

        return shouldUpdate ? shouldUpdate(operations, change) : true;
      };
      let isSubscribed = true;
      const queuedCallback = deferred
        ? (operations?: readonly Operation[], change?: EditorCommit) => {
            if (isSubscribed) {
              callbackProp(operations, change);
            }
          }
        : callbackProp;
      const callback = deferred
        ? (operations?: readonly Operation[], change?: EditorCommit) => {
            if (shouldNotify(operations, change)) {
              recordSlateReactRender({
                id: getSelectorProfileId(profileId, profileRuntimeId, 'notify'),
                kind: 'selector',
                runtimeId: profileRuntimeId,
              });
              queueDeferredCallback(
                deferredEventListeners.current,
                queuedCallback,
                operations,
                change
              );
            }
          }
        : (operations?: readonly Operation[], change?: EditorCommit) => {
            if (shouldNotify(operations, change)) {
              recordSlateReactRender({
                id: getSelectorProfileId(profileId, profileRuntimeId, 'notify'),
                kind: 'selector',
                runtimeId: profileRuntimeId,
              });
              callbackProp(operations, change);
            }
          };

      recordSlateReactRender({
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
