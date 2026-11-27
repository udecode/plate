import { createContext, useCallback, useContext, useMemo, useRef } from 'react';

import type {
  EditorCommit,
  EditorStateView,
  NamedRootKey,
  PluginsOf,
  NodeKey,
  ValueOf,
} from '../..';
import { readShownPreview } from '../../core/authored-runtime';
import { keyMovedAt } from '../../core/commit';
import { getEditorRuntimeOwner } from '../../core/editor-runtime';
import { runEditorObserver } from '../../core/lifecycle-error';
import { toPublicRoot } from '../../core/public-root';
import {
  getActiveCaretRoot,
  subscribeActiveCaretRoot,
} from '../../core/public-state';
import {
  commitMatchesSelectorDependencies,
  type EditorSelectorDependencies,
  normalizeSelectorDependencies,
  sameSelectorDependencies,
} from '../../core/selector-dependencies';
import type { BaseEditor } from '../../interfaces/editor';
import { PliteEditingAreaContext } from '../context';
import { subscribeEditorViewState } from '../editable/runtime-editor-api';
import type { EditorContextValue } from '../plugin/with-react';
import { recordPliteReactRender } from '../render-profiler';
import { useEditorContext } from './use-editor-context';
import { useGenericSelector } from './use-generic-selector';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';
import { useOptionalPliteRuntimeContext } from './use-plite-runtime';

type Callback = (change?: EditorCommit) => void;

export const callShouldUpdate = <TChange,>(
  editor: BaseEditor<any, any>,
  shouldUpdate: ((change?: TChange) => boolean) | undefined,
  change: TChange | undefined
) => {
  let changed = true;

  runEditorObserver(editor, 'commit-listener', () => {
    changed = shouldUpdate?.(change) ?? true;
  });

  return changed;
};

type DeferredCallbackPayload = {
  change?: EditorCommit;
};

type ContextEditor = EditorContextValue<any>;

export interface InternalEditorSelectorOptions<T = unknown> {
  deferred?: boolean;
  equalityFn?: (a: T, b: T) => boolean;
  includeRootOrderChanges?: boolean;
  profileId?: string;
  runtimeEventSource?: 'node' | 'path' | 'render' | 'selection';
  nodeKey?: NodeKey | null;
  nodeKeys?: readonly NodeKey[] | null;
  shouldUpdate?: (change?: EditorCommit) => boolean;
}

export type EditorSelectorContextValue = {
  addEventListener: (
    callback: Callback,
    options?: InternalEditorSelectorOptions
  ) => () => void;
  flushDeferred: () => void;
  invalidate: (nodeKeys: readonly NodeKey[]) => void;
};

/** Commit-subscription options for selectors that read from the editor. */
export interface EditorSelectorOptions<T = unknown> {
  deferred?: boolean;
  dependsOn?: EditorSelectorDependencies;
  equalityFn?: (a: T, b: T) => boolean;
}

/** Options for selectors that read from the immutable editor state view. */
export interface EditorStateSelectorOptions<T> {
  deferred?: boolean;
  dependsOn?: EditorSelectorDependencies;
  equalityFn?: (a: T, b: T) => boolean;
}

export const EditorSelectorContext =
  createContext<EditorSelectorContextValue | null>(null);

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
      `The \`useEditorSelector\` hook must be used inside <EditorRoot>.`
    );
  }

  return context;
}

export function useInternalEditorSelector<T>(
  selector: (editor: ContextEditor) => T,
  {
    deferred,
    equalityFn,
    includeRootOrderChanges,
    profileId,
    runtimeEventSource,
    nodeKey,
    nodeKeys,
    shouldUpdate,
  }: InternalEditorSelectorOptions<T> = {}
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
    (change?: EditorCommit) =>
      callShouldUpdate(editor, shouldUpdateRef.current, change),
    [editor]
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
 * Subscribe to editor commits and derive a render value from the editor.
 *
 * Scope updates with `dependsOn`, and use `useEditorState` when the selector
 * only needs the immutable state view.
 */
export function useEditorSelector<T>(
  selector: (editor: ContextEditor) => T,
  { deferred, dependsOn, equalityFn }: EditorSelectorOptions<T> = {}
): T {
  const normalizedDeps = normalizeSelectorDependencies(dependsOn);
  const { addEventListener } = useRequiredEditorSelectorContext();
  const contextEditor = useEditorContext();
  const insideEditingArea = useContext(PliteEditingAreaContext);
  const runtimeContext = useOptionalPliteRuntimeContext();
  const usesProviderContext = insideEditingArea || !runtimeContext;
  const owner =
    !usesProviderContext && runtimeContext
      ? getEditorRuntimeOwner(runtimeContext.runtime)
      : null;
  const fallbackRoot = contextEditor.read.view.root();
  const resolveTarget = useCallback((): ContextEditor => {
    if (usesProviderContext || !runtimeContext || !owner) {
      return contextEditor;
    }
    const activeRoot = getActiveCaretRoot(owner);
    const targetRoot =
      activeRoot !== null ? toPublicRoot(activeRoot) : fallbackRoot;

    return runtimeContext.rootEditor(targetRoot) as unknown as ContextEditor;
  }, [contextEditor, fallbackRoot, owner, runtimeContext, usesProviderContext]);
  const renderedSnapshotRef = useRef<{
    preview: ReturnType<typeof readShownPreview>;
    target: ContextEditor;
    version: number | undefined;
  } | null>(null);
  const genericSelector = useCallback(() => {
    const target = resolveTarget();

    renderedSnapshotRef.current = {
      preview: readShownPreview(target),
      target,
      version: target.read.lastCommit()?.version,
    };

    return selector(target);
  }, [resolveTarget, selector]);
  const [selectedState, update] = useGenericSelector(
    genericSelector,
    equalityFn
  );
  const updateFromCommit = useCallback(() => {
    update();
  }, [update]);
  const depsRef = useRef(normalizedDeps);

  useIsomorphicLayoutEffect(() => {
    const changed = !sameSelectorDependencies(depsRef.current, normalizedDeps);

    depsRef.current = normalizedDeps;

    if (changed) update();
  }, [normalizedDeps, update]);

  const matchesProviderCommit = useCallback(
    (change?: EditorCommit) =>
      commitMatchesSelectorDependencies(contextEditor, change, depsRef.current),
    [contextEditor]
  );

  useIsomorphicLayoutEffect(() => {
    const needsSync = () => {
      const rendered = renderedSnapshotRef.current;

      if (!rendered) return true;

      const liveTarget = resolveTarget();

      return (
        liveTarget !== rendered.target ||
        liveTarget.read.lastCommit()?.version !== rendered.version ||
        readShownPreview(liveTarget) !== rendered.preview
      );
    };

    if (usesProviderContext) {
      const unsubscribe = addEventListener(updateFromCommit, {
        deferred,
        shouldUpdate: matchesProviderCommit,
      });

      if (needsSync()) update();

      return unsubscribe;
    }

    let cancelled = false;
    let scheduled = false;
    let currentTarget: ContextEditor | null = null;
    let unsubscribeCommit: (() => void) | null = null;
    let unsubscribeView: (() => void) | null = null;
    const scheduleUpdate = () => {
      if (cancelled) return;
      if (!deferred) {
        update();
        return;
      }
      if (scheduled) return;
      scheduled = true;
      scheduleMicrotask(() => {
        scheduled = false;
        if (cancelled) return;
        update();
      });
    };
    const follow = (notifyOnSwitch: boolean) => {
      const next = resolveTarget();

      if (next === currentTarget) return;
      unsubscribeCommit?.();
      unsubscribeView?.();
      currentTarget = next;
      unsubscribeCommit = next.subscribeCommit((change) => {
        if (resolveTarget() !== next) {
          follow(true);
          return;
        }
        if (commitMatchesSelectorDependencies(next, change, depsRef.current)) {
          scheduleUpdate();
        }
      });
      unsubscribeView = subscribeEditorViewState(next, (change) => {
        if (resolveTarget() !== next) {
          follow(true);
          return;
        }
        if (change === 'authored') scheduleUpdate();
      });
      if (notifyOnSwitch) scheduleUpdate();
    };

    follow(false);
    const unsubscribeCaretRoot = owner
      ? subscribeActiveCaretRoot(owner, () => follow(true))
      : () => {};

    if (needsSync()) update();

    return () => {
      cancelled = true;
      unsubscribeCaretRoot();
      unsubscribeCommit?.();
      unsubscribeView?.();
    };
  }, [
    addEventListener,
    deferred,
    matchesProviderCommit,
    owner,
    resolveTarget,
    update,
    updateFromCommit,
    usesProviderContext,
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
  { deferred, dependsOn, equalityFn }: EditorStateSelectorOptions<T> = {}
): T {
  const stateSelector = useCallback(
    (editor: ContextEditor) => editor.read((state) => selector(state)),
    [selector]
  );

  return useEditorSelector<T>(stateSelector, {
    deferred,
    dependsOn,
    equalityFn,
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

  const collectInvalidated = useCallback((nodeKeys: readonly NodeKey[]) => {
    const listeners = new Set<Callback>();

    for (const nodeKey of nodeKeys) {
      runtimeEventListeners.current.get(nodeKey)?.forEach((listener) => {
        listeners.add(listener);
      });
      runtimeRenderEventListeners.current.get(nodeKey)?.forEach((listener) => {
        listeners.add(listener);
      });
    }

    return listeners;
  }, []);

  const invalidate = useCallback(
    (nodeKeys: readonly NodeKey[]) => {
      collectInvalidated(nodeKeys).forEach((listener) => {
        listener();
      });

      if (deferredEventListeners.current.size > 0) {
        scheduleDeferredFlush();
      }
    },
    [collectInvalidated, scheduleDeferredFlush]
  );

  const onChange = useCallback(
    (
      change?: EditorCommit,
      invalidatedNodeKeys: readonly NodeKey[] = [],
      root?: NamedRootKey
    ) => {
      eventListeners.current.forEach((listener) => {
        listener(change);
      });

      const shouldRouteRootOrderRuntimeListeners = Boolean(
        rootOrderRuntimeEventListeners.current.size &&
        change?.changed.hasAny('root-order')
      );
      const runtimeCallbacks = new Set<Callback>();
      const invalidatedRuntimeCallbacks =
        collectInvalidated(invalidatedNodeKeys);
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
        if (
          (nodes.size || paths.size) &&
          change.changed.has('structure', root)
        ) {
          for (const map of [nodes, paths]) {
            for (const [key, listeners] of map) {
              if (keyMovedAt(change.changed, key, root)) {
                listeners.forEach((listener) => runtimeCallbacks.add(listener));
              }
            }
          }
        }
      }
      invalidatedRuntimeCallbacks.forEach((listener) => {
        runtimeCallbacks.add(listener);
      });
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
    [collectInvalidated, scheduleDeferredFlush]
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
      }: InternalEditorSelectorOptions = {}
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
      invalidate,
    }),
    [addEventListener, flushDeferred, invalidate]
  );

  return { selectorContext, onChange };
}

export function useFlushDeferredSelectorsOnRender() {
  const { flushDeferred } = useRequiredEditorSelectorContext();
  useIsomorphicLayoutEffect(flushDeferred);
}
