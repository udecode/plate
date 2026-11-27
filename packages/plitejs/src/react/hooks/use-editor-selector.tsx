import { createContext, useCallback, useContext, useMemo, useRef } from 'react';

import type { EditorCommit, NamedRootKey, NodeKey } from '../..';
import { keyMovedAt } from '../../core/commit';
import { getEditorRuntimeOwner } from '../../core/editor-runtime';
import { runEditorObserver } from '../../core/lifecycle-error';
import { toPublicRoot } from '../../core/public-root';
import {
  getActiveCaretRoot,
  subscribeActiveCaretRoot,
} from '../../core/public-state';
import { sameResult } from '../../core/same-result';
import {
  commitMatchesSelectorDependencies,
  type EditorSelectorDependencies,
  type NormalizedSelectorDependencies,
  normalizeSelectorDependencies,
  sameSelectorDependencies,
  selectorDependenciesSubscriptionKey,
  selectorDependenciesViewSubscription,
  selectorDependenciesWantCommits,
} from '../../core/selector-dependencies';
import type { AnyEditor, BaseEditor } from '../../interfaces/editor';
import { PliteEditingAreaContext } from '../context';
import {
  type EditorViewStateFacts,
  readEditorViewStateFacts,
  subscribeSharedEditorViewState,
  viewStateFactsChanged,
} from '../editable/runtime-editor-api';
import type { EditorContextValue } from '../plugin/with-react';
import { recordPliteReactRender } from '../render-profiler';
import {
  useEditorContext,
  useOptionalEditorContext,
} from './use-editor-context';
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
  handlesViewState?: boolean;
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

/** Commit and view-state subscription options for `useEditorSelector`. */
export type UseEditorSelectorOptions<T = unknown> = {
  dependsOn?: EditorSelectorDependencies;
  equalityFn?: (a: T, b: T) => boolean;
};

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
 * Subscribe to editor commits and view-state changes and derive a render value
 * from the active context editor or an explicit editor instance.
 *
 * Scope updates with `dependsOn` using commit kinds, state fields, node keys,
 * or view-state tokens (`'authored'`, `'composing'`, `'focused'`, `'readOnly'`,
 * `'view'`). Omitting `dependsOn` subscribes to commits and all view-state
 * changes (including focus and composition).
 */
export function useEditorSelector<T>(
  selector: (editor: ContextEditor) => T,
  options?: UseEditorSelectorOptions<T>
): T;
export function useEditorSelector<T, TEditor extends AnyEditor = AnyEditor>(
  editor: TEditor,
  selector: (editor: TEditor) => T,
  options?: UseEditorSelectorOptions<T>
): T;
export function useEditorSelector<T>(
  arg0: AnyEditor | ((editor: ContextEditor) => T),
  arg1?: ((editor: AnyEditor) => T) | UseEditorSelectorOptions<T>,
  arg2?: UseEditorSelectorOptions<T>
): T {
  const hasExplicitEditor = typeof arg0 !== 'function';
  const explicitEditor = hasExplicitEditor ? arg0 : null;
  const selector = (hasExplicitEditor ? arg1 : arg0) as (
    editor: AnyEditor
  ) => T;
  const { dependsOn, equalityFn } = ((hasExplicitEditor ? arg2 : arg1) ??
    {}) as UseEditorSelectorOptions<T>;
  const normalizedDeps = normalizeSelectorDependencies(dependsOn);
  const subscriptionKey = selectorDependenciesSubscriptionKey(normalizedDeps);
  const selectorContext = useContext(EditorSelectorContext);
  const contextEditor = useOptionalEditorContext();
  const insideEditingArea = useContext(PliteEditingAreaContext);
  const runtimeContext = useOptionalPliteRuntimeContext();

  if (!hasExplicitEditor && (!selectorContext || !contextEditor)) {
    throw new Error(
      `The \`useEditorSelector\` hook must be used inside <EditorRoot>.`
    );
  }

  const usesProviderContext =
    !hasExplicitEditor && (insideEditingArea || !runtimeContext);
  const owner =
    !hasExplicitEditor && !usesProviderContext && runtimeContext
      ? getEditorRuntimeOwner(runtimeContext.runtime)
      : null;
  const fallbackRoot =
    !hasExplicitEditor && contextEditor
      ? contextEditor.read.view.root()
      : undefined;
  const resolveTarget = useCallback((): AnyEditor => {
    if (explicitEditor) return explicitEditor;
    if (usesProviderContext || !runtimeContext || !owner) {
      return contextEditor as AnyEditor;
    }
    const activeRoot = getActiveCaretRoot(owner);
    const targetRoot =
      activeRoot !== null ? toPublicRoot(activeRoot) : fallbackRoot;

    return runtimeContext.rootEditor(targetRoot);
  }, [
    contextEditor,
    explicitEditor,
    fallbackRoot,
    owner,
    runtimeContext,
    usesProviderContext,
  ]);
  const depsRef = useRef(normalizedDeps);
  const committedSnapshotRef = useRef<{
    deps: NormalizedSelectorDependencies;
    facts: EditorViewStateFacts;
    target: AnyEditor;
    version: number | undefined;
  } | null>(null);
  const updatingRef = useRef(false);
  const genericSelector = useCallback(() => {
    const target = resolveTarget();
    const deps = depsRef.current;
    const snapshot = {
      deps,
      facts: readEditorViewStateFacts(target, deps),
      target,
      version: target.read.lastCommit()?.version,
    };
    const value = target.read(() => selector(target));

    if (updatingRef.current) {
      committedSnapshotRef.current = snapshot;
    }

    return { snapshot, value };
  }, [resolveTarget, selector]);
  const compareEntry = useCallback(
    (
      previous: Readonly<{
        snapshot: {
          deps: NormalizedSelectorDependencies;
          facts: EditorViewStateFacts;
          target: AnyEditor;
          version: number | undefined;
        };
        value: T;
      }>,
      next: Readonly<{
        snapshot: {
          deps: NormalizedSelectorDependencies;
          facts: EditorViewStateFacts;
          target: AnyEditor;
          version: number | undefined;
        };
        value: T;
      }>
    ) => (equalityFn ?? sameResult)(previous.value, next.value),
    [equalityFn]
  );
  const [selectedEntry, update] = useGenericSelector(
    genericSelector,
    compareEntry
  );
  const selectedState = selectedEntry.value;
  const runUpdate = useCallback(() => {
    updatingRef.current = true;
    try {
      update();
    } finally {
      updatingRef.current = false;
    }
  }, [update]);

  useIsomorphicLayoutEffect(() => {
    committedSnapshotRef.current = selectedEntry.snapshot;

    const changed = !sameSelectorDependencies(depsRef.current, normalizedDeps);

    depsRef.current = normalizedDeps;

    if (changed) runUpdate();
  });

  const matchesProviderCommit = useCallback(
    (change?: EditorCommit) =>
      contextEditor
        ? commitMatchesSelectorDependencies(
            contextEditor,
            change,
            depsRef.current
          )
        : false,
    [contextEditor]
  );

  useIsomorphicLayoutEffect(() => {
    let cancelled = false;
    const scheduleUpdate = () => {
      if (cancelled) return;
      runUpdate();
    };
    const activeDeps = depsRef.current;
    const wantsCommits = selectorDependenciesWantCommits(activeDeps);
    const viewSub = selectorDependenciesViewSubscription(activeDeps);
    const needsSync = () => {
      const committed = committedSnapshotRef.current;

      if (!committed) return true;

      const liveTarget = resolveTarget();

      if (liveTarget !== committed.target) return true;
      if (!sameSelectorDependencies(committed.deps, depsRef.current)) {
        return true;
      }
      if (
        wantsCommits &&
        liveTarget.read.lastCommit()?.version !== committed.version
      ) {
        return true;
      }

      return viewStateFactsChanged(
        committed.facts,
        readEditorViewStateFacts(liveTarget, depsRef.current),
        depsRef.current
      );
    };

    let unsubscribeCommit: (() => void) | null = null;
    let unsubscribeView: (() => void) | null = null;
    let unsubscribeCaretRoot: (() => void) | null = null;

    if (usesProviderContext && selectorContext && contextEditor) {
      const addProviderListener = selectorContext.addEventListener;
      let lastFacts =
        committedSnapshotRef.current?.target === contextEditor &&
        sameSelectorDependencies(committedSnapshotRef.current.deps, activeDeps)
          ? committedSnapshotRef.current.facts
          : readEditorViewStateFacts(contextEditor, activeDeps);
      if (wantsCommits) {
        unsubscribeCommit = addProviderListener(runUpdate, {
          handlesViewState: true,
          shouldUpdate: matchesProviderCommit,
        });
      }
      if (viewSub !== null) {
        unsubscribeView = subscribeSharedEditorViewState(
          contextEditor,
          viewSub,
          () => {
            const currentDeps = depsRef.current;
            const committed = committedSnapshotRef.current;
            const baseline =
              committed?.target === contextEditor &&
              sameSelectorDependencies(committed.deps, currentDeps)
                ? committed.facts
                : lastFacts;
            const nextFacts = readEditorViewStateFacts(
              contextEditor,
              currentDeps
            );
            const changed = viewStateFactsChanged(
              baseline,
              nextFacts,
              currentDeps
            );

            lastFacts = nextFacts;
            if (changed) scheduleUpdate();
          }
        );
      }
    } else {
      let currentTarget: AnyEditor | null = null;
      let lastFacts: EditorViewStateFacts | null = null;
      const follow = (notifyOnSwitch: boolean) => {
        const next = resolveTarget();

        if (next === currentTarget) return;
        unsubscribeCommit?.();
        unsubscribeView?.();
        unsubscribeCommit = null;
        unsubscribeView = null;
        currentTarget = next;
        const currentDeps = depsRef.current;
        const initialCommitted = committedSnapshotRef.current;
        lastFacts =
          initialCommitted &&
          initialCommitted.target === next &&
          sameSelectorDependencies(initialCommitted.deps, currentDeps)
            ? initialCommitted.facts
            : readEditorViewStateFacts(next, currentDeps);
        if (wantsCommits) {
          unsubscribeCommit = next.subscribeCommit((change) => {
            if (!hasExplicitEditor && resolveTarget() !== next) {
              follow(true);
              return;
            }
            if (
              commitMatchesSelectorDependencies(next, change, depsRef.current)
            ) {
              scheduleUpdate();
            }
          });
        }
        if (viewSub !== null) {
          unsubscribeView = subscribeSharedEditorViewState(
            next,
            viewSub,
            () => {
              if (!hasExplicitEditor && resolveTarget() !== next) {
                follow(true);
                return;
              }
              const depsNow = depsRef.current;
              const committed = committedSnapshotRef.current;
              const baseline =
                committed &&
                committed.target === next &&
                sameSelectorDependencies(committed.deps, depsNow)
                  ? committed.facts
                  : (lastFacts ?? readEditorViewStateFacts(next, depsNow));
              const nextFacts = readEditorViewStateFacts(next, depsNow);
              const changed = viewStateFactsChanged(
                baseline,
                nextFacts,
                depsNow
              );

              lastFacts = nextFacts;
              if (changed) scheduleUpdate();
            }
          );
        }
        if (notifyOnSwitch) scheduleUpdate();
      };

      follow(false);
      if (!hasExplicitEditor && owner) {
        unsubscribeCaretRoot = subscribeActiveCaretRoot(owner, () =>
          follow(true)
        );
      }
    }

    if (needsSync()) runUpdate();

    return () => {
      cancelled = true;
      unsubscribeCaretRoot?.();
      unsubscribeCommit?.();
      unsubscribeView?.();
    };
  }, [
    contextEditor,
    hasExplicitEditor,
    matchesProviderCommit,
    owner,
    resolveTarget,
    runUpdate,
    selectorContext,
    subscriptionKey,
    usesProviderContext,
  ]);

  return selectedState;
}

export function useEditorSelectorContext() {
  const eventListeners = useRef(new Set<Callback>());
  const viewAwareEventListeners = useRef(new Set<Callback>());
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
      root?: NamedRootKey,
      options?: Readonly<{ skipPublicSelectors?: boolean }>
    ) => {
      eventListeners.current.forEach((listener) => {
        if (
          options?.skipPublicSelectors &&
          viewAwareEventListeners.current.has(listener)
        ) {
          return;
        }
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
        handlesViewState = false,
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
      if (handlesViewState) {
        viewAwareEventListeners.current.add(callback);
      }

      return () => {
        if (!isSubscribed) return;
        isSubscribed = false;
        deferredEventListeners.current.delete(queuedCallback);
        eventListeners.current.delete(callback);
        viewAwareEventListeners.current.delete(callback);
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
