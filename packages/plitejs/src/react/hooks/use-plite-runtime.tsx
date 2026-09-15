import React, {
  type DependencyList,
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';

import {
  type CompatibleEditorCommand,
  type EditorCommandDescriptor,
  type EditorCommandInput,
  type EditorCommit,
  type Editor,
  type EditorStateView,
  type EditorView,
  type EditorViewOptions,
  type PluginsOf,
  type NamedRootKey,
  type Path,
  type RootKey,
  type Selection,
  SelectionApi,
  type Value,
  type ValueOf,
} from '../..';
import { createAuthoredFragmentView } from '../../core/authored-fragment-view';
import type { NativeAuthoredFragment } from '../../core/authored-runtime';
import {
  createEditorCommitPublicationQueue,
  publishEditorCommitInVersionOrder,
} from '../../core/commit-publication';
import { releaseEditorViewLifetime } from '../../core/editor-view-lifetime';
import { createEditorViewPluginApis } from '../../core/plugin';
import type { DOMApi, DOMPlugin } from '../../dom';
import {
  createDOMEditorCapability,
  EDITOR_TO_ROOT_VIEW_EDITORS,
} from '../../dom/internal';
import { createEditorViewRuntime } from '../../editor-runtime-view';
import { EditorAnnouncementLiveRegion } from '../components/editor-announcement-live-region';
import { PliteEditableRootContext } from '../context';
import {
  getEditorRuntime,
  getEditorRuntimeOwner,
  inheritPluginRegistry,
  dispatchCommand,
  setEditorRuntime,
  getLastCommit as editorGetLastCommit,
  getSnapshot as editorGetSnapshot,
} from '../editable/runtime-editor-api';
import { getSchemaInvalidatedNodeKeys } from '../editable/schema-runtime-invalidation';
import {
  type ReactRuntimeEditor,
  toReactRuntimeEditor,
} from '../plugin/react-editor';
import type {
  Editor as ReactEditorType,
  ReactPlugin,
} from '../plugin/with-react';
import { profilePliteReactDuration } from '../render-profiler';
import { MAIN_ROOT_KEY, toPublicRootOption } from '../root-key';
import { REACT_MAJOR_VERSION } from '../utils/environment';
import { setPliteViewSelectionStoreKey } from '../view-selection';
import { focusPliteEditable } from './focus-plite-editable';
import { createRootSelectionCache } from './root-selection-cache';
import { useOptionalEditorContext } from './use-editor-context';
import {
  type EditorSelectorContextValue,
  useEditorSelectorContext,
} from './use-editor-selector';
import { useGenericSelector } from './use-generic-selector';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';
import { useRuntimeFocusState } from './use-runtime-focus-state';

const refEquality = <T,>(a: T | null, b: T) => a === b;
const rootKeyEquality = (
  a: RootKey | null | undefined,
  b: RootKey | undefined
) => a === b;
const selectionChanged = (change?: EditorCommit) =>
  Boolean(change?.selectionChanged);

const selectActiveRoot = (state: EditorStateView<any, any>): RootKey => {
  const selection = state.selection();

  return SelectionApi.root(selection) ?? MAIN_ROOT_KEY;
};

const selectPublicActiveRoot = (
  state: EditorStateView<any, any>
): RootKey | undefined => toPublicRootOption(selectActiveRoot(state));

type PluginLike = {
  name: string;
};

/** Ownership record that connects a child content root to its parent element. */
export type PliteContentRootOwner = {
  childRoot: RootKey;
  ownerPath: Path;
  ownerRoot: RootKey;
};

const getContentRootOwnerKey = (owner: PliteContentRootOwner) =>
  `${owner.ownerRoot}\u0000${owner.ownerPath.join('.')}\u0000${
    owner.childRoot
  }`;

export const unregisterContentRootOwnerViewEditor = <TEditor,>(
  ownerViewEditors: Map<string, TEditor>,
  owner: PliteContentRootOwner,
  editor: TEditor
) => {
  const ownerKey = getContentRootOwnerKey(owner);

  if (ownerViewEditors.get(ownerKey) !== editor) {
    return false;
  }

  return ownerViewEditors.delete(ownerKey);
};

const createReactApi = (domApi: DOMApi) =>
  Object.freeze({
    isComposing: () => domApi.isComposing(),
    isFocused: () => domApi.isFocused(),
    isReadOnly: () => domApi.isReadOnly(),
  });

export const createPliteViewEffectQueue = () => {
  const effects = new Set<() => void>();

  return {
    flush: () => {
      const pendingEffects = Array.from(effects);

      pendingEffects.forEach((effect) => {
        if (effects.has(effect)) {
          effect();
        }
      });
    },
    hasEffects: () => effects.size > 0,
    register: (effect: () => void) => {
      effects.add(effect);

      return () => {
        effects.delete(effect);
      };
    },
  };
};

type PliteRuntimeContextValue<
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
> = {
  focusVersion: number;
  focused: boolean;
  getActiveContentRootOwner: (root: RootKey) => PliteContentRootOwner | null;
  getAuthoredFragmentView: <TEditor extends Editor>(
    parent: TEditor,
    fragment: NativeAuthoredFragment
  ) => ReactRuntimeViewEditor<ValueOf<TEditor>, PluginsOf<TEditor>>;
  getContentRootOwnerViewEditor: (
    owner: PliteContentRootOwner
  ) => ReactRuntimeEditor<V, PluginsOf<ReactEditorType<V, TPlugins>>> | null;
  getLastSelectionForRoot: (root: RootKey) => Selection;
  getMountedViewEditor: (
    root: RootKey
  ) => ReactRuntimeEditor<V, PluginsOf<ReactEditorType<V, TPlugins>>> | null;
  getView: (
    options?: EditorViewOptions
  ) => EditorView<V, PluginsOf<ReactEditorType<V, TPlugins>>>;
  mountAuthoredFragmentView: (view: object) => () => void;
  registerContentRootOwner: (
    editor: ReactRuntimeEditor<V, PluginsOf<ReactEditorType<V, TPlugins>>>,
    owner: PliteContentRootOwner
  ) => () => void;
  registerViewEffect: (effect: () => void) => () => void;
  registerViewEditor: (
    editor: ReactRuntimeEditor<V, PluginsOf<ReactEditorType<V, TPlugins>>>,
    root: RootKey
  ) => () => void;
  runtime: ReactEditorType<V, TPlugins>;
  selectorContext: EditorSelectorContextValue;
  setActiveViewEditor: (
    editor: ReactRuntimeEditor<V, PluginsOf<ReactEditorType<V, TPlugins>>>,
    root: RootKey
  ) => void;
};

type PliteRuntimeProviderProps<
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
> = {
  children: ReactNode;
  editor: ReactEditorType<V, TPlugins>;
};

/** Selector options for `useRuntimeState` and `useRootState`. */
export type RuntimeStateSelectorOptions<T> = {
  deferred?: boolean;
  equalityFn?: (a: T | null, b: T) => boolean;
  shouldUpdate?: (change?: EditorCommit) => boolean;
};

export const PliteRuntimeContext = createContext<PliteRuntimeContextValue<
  any,
  any
> | null>(null);

export type ReactRuntimeViewEditor<
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
> = ReactRuntimeEditor<V, TPlugins> & EditorView<V, TPlugins>;

export const createReactRuntimeViewEditor = <
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly unknown[],
>(
  view: EditorView<V, TPlugins>,
  shared?: ReactRuntimeViewEditor<V, TPlugins>
): ReactRuntimeViewEditor<V, TPlugins> => {
  const runtime = getEditorRuntime(view as any);
  const runtimeOwner = getEditorRuntimeOwner(view);
  const {
    api: _api,
    plugin: _plugin,
    ...descriptors
  } = Object.getOwnPropertyDescriptors(view);
  const editor = Object.create(Object.getPrototypeOf(view)) as EditorView<
    V,
    TPlugins
  >;

  Object.defineProperties(editor, descriptors);
  setEditorRuntime(
    editor as any,
    runtime,
    runtimeOwner,
    view.read.view.root() ?? MAIN_ROOT_KEY
  );
  inheritPluginRegistry(editor as any, (shared ?? view) as any);

  const { clipboard, ...domApi } = createDOMEditorCapability(
    toReactRuntimeEditor(editor)
  );
  const reactApi = createReactApi(domApi);
  const scopedDomApi = Object.freeze({ ...domApi, clipboard });
  let bound: ReturnType<typeof createEditorViewPluginApis> | null = null;
  const getBound = () =>
    (bound ??= createEditorViewPluginApis(editor, shared ?? view));
  const baseApi = (shared?.api ?? view.api) as Record<PropertyKey, unknown>;
  const viewApi = new Proxy(baseApi, {
    get(target, property, receiver) {
      if (property === 'dom') {
        return scopedDomApi;
      }
      if (property === 'react') {
        return reactApi;
      }

      return Reflect.get(
        getBound().api as Record<PropertyKey, unknown>,
        property,
        receiver
      );
    },
  }) as ReactRuntimeEditor<V, TPlugins>['api'];

  const pluginPortal = ((plugin: PluginLike) => {
    const sharedPortal = shared
      ? (
          shared.plugin as unknown as (plugin: PluginLike) => {
            api: unknown;
            read: unknown;
            update: unknown;
          }
        )(plugin)
      : null;
    const portal = (
      getBound().plugin as unknown as (plugin: PluginLike) => {
        api: unknown;
        read: unknown;
        update: unknown;
      }
    )(plugin);

    return new Proxy(portal, {
      get(target, property, receiver) {
        if (property === 'api') {
          const capability = Reflect.get(target, property, receiver);

          return Reflect.get(viewApi, plugin.name) ?? capability;
        }
        if (property === 'read') {
          return sharedPortal?.read ?? Reflect.get(target, property, receiver);
        }
        if (property === 'update') {
          return (
            sharedPortal?.update ?? Reflect.get(target, property, receiver)
          );
        }

        return Reflect.get(target, property, receiver);
      },
    });
  }) as ReactRuntimeEditor<V, TPlugins>['plugin'];

  Object.defineProperties(editor, {
    api: {
      enumerable: true,
      value: viewApi,
    },
    plugin: {
      enumerable: true,
      value: pluginPortal,
    },
  });

  return Object.freeze(editor) as ReactRuntimeViewEditor<V, TPlugins>;
};

const isRootAffected = (root: RootKey, change?: EditorCommit) =>
  !change || change.changed.has('snapshot', toPublicRootOption(root));

export function useOptionalPliteRuntimeContext() {
  return useContext(PliteRuntimeContext);
}

export function useRequiredPliteRuntimeContext<
  V extends Value = any,
  TPlugins extends readonly unknown[] = any,
>() {
  const context = useContext(PliteRuntimeContext);

  if (!context) {
    throw new Error('Plite roots must be rendered inside <EditorRoot>.');
  }

  return context as unknown as PliteRuntimeContextValue<V, TPlugins>;
}

export const useMountedEditorRuntimeOwner = (
  component: 'EditorRoot',
  editor: Parameters<typeof getEditorRuntimeOwner>[0] | undefined
) => {
  const owner = editor ? getEditorRuntimeOwner(editor) : null;
  const [mountedOwner] = useState(() => owner);

  if (mountedOwner !== owner) {
    throw new Error(
      `[${component}] Cannot replace the editor runtime of a mounted provider. Remount <${component}> with a different React key.`
    );
  }
};

export function PliteRuntimeProvider<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly [],
>({ children, editor: runtime }: PliteRuntimeProviderProps<V, TPlugins>) {
  const { selectorContext, onChange: handleSelectorChange } =
    useEditorSelectorContext();
  const [commitPublicationQueue] = useState(() =>
    createEditorCommitPublicationQueue<V>(
      editorGetLastCommit(runtime)?.version ?? 0
    )
  );
  const reactEditor = toReactRuntimeEditor(runtime);
  const mountedViewEditorsRef = useRef(
    new Map<RootKey, Set<typeof reactEditor>>()
  );
  const activeViewEditorsRef = useRef(new Map<RootKey, typeof reactEditor>());
  const contentRootOwnersRef = useRef(
    new Map<typeof reactEditor, PliteContentRootOwner>()
  );
  const contentRootOwnerViewEditorsRef = useRef(
    new Map<string, typeof reactEditor>()
  );
  const authoredFragmentViewsRef = useRef(
    new Map<
      string,
      {
        key: string;
        mounts: number;
        view: object;
      }
    >()
  );
  const authoredFragmentViewEntriesRef = useRef(
    new WeakMap<object, { key: string; mounts: number; view: object }>()
  );
  const activeContentRootOwnersRef = useRef(
    new Map<RootKey, PliteContentRootOwner>()
  );
  const [viewEffectQueue] = useState(createPliteViewEffectQueue);
  const [viewEffectVersion, setViewEffectVersion] = useState(0);
  const [lastSelectionCache] = useState(createRootSelectionCache);
  const { focused, focusVersion, refreshFocused } =
    useRuntimeFocusState(reactEditor);

  const getView = useCallback(
    (options: EditorViewOptions = {}) =>
      createEditorViewRuntime(runtime, options),
    [runtime]
  );
  const getAuthoredFragmentView = useCallback(
    <TEditor extends Editor>(
      parent: TEditor,
      fragment: NativeAuthoredFragment
    ) => {
      const key = JSON.stringify([
        fragment.changeId,
        fragment.id,
        fragment.root,
      ]);
      const cached = authoredFragmentViewsRef.current.get(key);

      if (cached) {
        return cached.view as ReactRuntimeViewEditor<
          ValueOf<TEditor>,
          PluginsOf<TEditor>
        >;
      }

      const view = createReactRuntimeViewEditor(
        createAuthoredFragmentView(parent, fragment, {
          retainWhile: 'document',
        })
      );
      const entry = {
        key,
        mounts: 0,
        view,
      };

      authoredFragmentViewsRef.current.set(key, entry);
      authoredFragmentViewEntriesRef.current.set(entry.view, entry);
      queueMicrotask(() => {
        if (
          entry.mounts === 0 &&
          authoredFragmentViewsRef.current.get(key) === entry
        ) {
          authoredFragmentViewsRef.current.delete(key);
        }
      });
      return view;
    },
    []
  );
  const mountAuthoredFragmentView = useCallback((view: object) => {
    const entry = authoredFragmentViewEntriesRef.current.get(view);

    if (!entry) return () => {};

    entry.mounts += 1;
    authoredFragmentViewsRef.current.set(entry.key, entry);
    return () => {
      entry.mounts -= 1;
      queueMicrotask(() => {
        if (
          entry.mounts === 0 &&
          authoredFragmentViewsRef.current.get(entry.key) === entry
        ) {
          authoredFragmentViewsRef.current.delete(entry.key);
        }
      });
    };
  }, []);
  const registerViewEditor = useCallback(
    (editor: typeof reactEditor, root: RootKey) => {
      const viewEditors = mountedViewEditorsRef.current.get(root) ?? new Set();
      const rootViewEditors =
        EDITOR_TO_ROOT_VIEW_EDITORS.get(runtime) ?? new Set();

      viewEditors.add(editor);
      mountedViewEditorsRef.current.set(root, viewEditors);
      if (!activeViewEditorsRef.current.has(root)) {
        activeViewEditorsRef.current.set(root, editor);
      }
      rootViewEditors.add(editor as unknown as Editor);
      EDITOR_TO_ROOT_VIEW_EDITORS.set(runtime, rootViewEditors);

      return () => {
        releaseEditorViewLifetime(editor);
        viewEditors.delete(editor);
        rootViewEditors.delete(editor as unknown as Editor);
        const owner = contentRootOwnersRef.current.get(editor);

        contentRootOwnersRef.current.delete(editor);
        if (owner) {
          unregisterContentRootOwnerViewEditor(
            contentRootOwnerViewEditorsRef.current,
            owner,
            editor
          );
        }

        if (activeViewEditorsRef.current.get(root) === editor) {
          const nextEditor = viewEditors.values().next().value;

          if (nextEditor) {
            activeViewEditorsRef.current.set(root, nextEditor);
          } else {
            activeViewEditorsRef.current.delete(root);
          }
        }
        if (viewEditors.size === 0) {
          mountedViewEditorsRef.current.delete(root);
        }
        if (rootViewEditors.size === 0) {
          EDITOR_TO_ROOT_VIEW_EDITORS.delete(runtime);
        }
      };
    },
    [runtime]
  );
  const setActiveViewEditor = useCallback(
    (editor: typeof reactEditor, root: RootKey) => {
      const viewEditors = mountedViewEditorsRef.current.get(root);

      if (viewEditors?.has(editor) || root === MAIN_ROOT_KEY) {
        activeViewEditorsRef.current.set(root, editor);
        const owner = contentRootOwnersRef.current.get(editor);

        if (owner) {
          activeContentRootOwnersRef.current.set(root, owner);
        }
      }
    },
    []
  );
  const getMountedViewEditor = useCallback(
    (root: RootKey) => {
      const viewEditors = mountedViewEditorsRef.current.get(root);
      const activeViewEditor = activeViewEditorsRef.current.get(root);
      const viewEditor =
        activeViewEditor && viewEditors?.has(activeViewEditor)
          ? activeViewEditor
          : viewEditors?.values().next().value;

      return viewEditor ?? (root === MAIN_ROOT_KEY ? reactEditor : null);
    },
    [reactEditor]
  );
  const registerContentRootOwner = useCallback(
    (editor: typeof reactEditor, owner: PliteContentRootOwner) => {
      contentRootOwnersRef.current.set(editor, owner);
      contentRootOwnerViewEditorsRef.current.set(
        getContentRootOwnerKey(owner),
        editor
      );

      return () => {
        if (contentRootOwnersRef.current.get(editor) === owner) {
          contentRootOwnersRef.current.delete(editor);
          unregisterContentRootOwnerViewEditor(
            contentRootOwnerViewEditorsRef.current,
            owner,
            editor
          );
        }
      };
    },
    []
  );
  const getContentRootOwnerViewEditor = useCallback(
    (owner: PliteContentRootOwner) =>
      contentRootOwnerViewEditorsRef.current.get(
        getContentRootOwnerKey(owner)
      ) ?? null,
    []
  );
  const getActiveContentRootOwner = useCallback((root: RootKey) => {
    const activeOwner = activeContentRootOwnersRef.current.get(root);

    if (
      activeOwner &&
      contentRootOwnerViewEditorsRef.current.has(
        getContentRootOwnerKey(activeOwner)
      )
    ) {
      return activeOwner;
    }

    const activeViewEditor = activeViewEditorsRef.current.get(root);

    return activeViewEditor
      ? (contentRootOwnersRef.current.get(activeViewEditor) ?? null)
      : null;
  }, []);
  const getLastSelectionForRoot = useCallback(
    (root: RootKey) => lastSelectionCache.get(root),
    [lastSelectionCache]
  );
  const registerViewEffect = useCallback(
    (effect: () => void) => {
      const unregister = viewEffectQueue.register(effect);

      setViewEffectVersion((version) => version + 1);

      return unregister;
    },
    [viewEffectQueue]
  );

  useIsomorphicLayoutEffect(() => {
    const maybeBatchUpdates =
      REACT_MAJOR_VERSION < 18
        ? ReactDOM.unstable_batchedUpdates
        : (callback: () => void) => {
            callback();
          };

    const publishCommit: Parameters<typeof runtime.subscribeCommit>[0] = (
      commit
    ) => {
      lastSelectionCache.record(
        commit.selectionAfter,
        commit.selectionAfterRoot
      );

      maybeBatchUpdates(() => {
        profilePliteReactDuration('focused-state', refreshFocused);

        handleSelectorChange(
          commit,
          getSchemaInvalidatedNodeKeys(runtime, commit)
        );

        if (viewEffectQueue.hasEffects()) {
          setViewEffectVersion((version) => version + 1);
        }
      });
    };

    const onContextChange: Parameters<typeof runtime.subscribeCommit>[0] = (
      commit,
      snapshot
    ) => {
      publishEditorCommitInVersionOrder(
        commitPublicationQueue,
        commit,
        snapshot,
        publishCommit
      );
    };
    const unsubscribe = runtime.subscribeCommit(onContextChange);
    const latestCommit = editorGetLastCommit(runtime);

    if (
      latestCommit &&
      latestCommit.version > commitPublicationQueue.lastVersion
    ) {
      publishEditorCommitInVersionOrder(
        commitPublicationQueue,
        latestCommit,
        editorGetSnapshot(runtime),
        publishCommit,
        { allowVersionGap: true }
      );
    }

    return unsubscribe;
  }, [
    commitPublicationQueue,
    handleSelectorChange,
    lastSelectionCache,
    reactEditor,
    refreshFocused,
    runtime,
    viewEffectQueue,
  ]);

  useIsomorphicLayoutEffect(() => {
    if (viewEffectVersion === 0) {
      return;
    }

    viewEffectQueue.flush();
  }, [viewEffectQueue, viewEffectVersion]);

  const value = useMemo(
    () => ({
      focusVersion,
      focused,
      getActiveContentRootOwner,
      getAuthoredFragmentView,
      getContentRootOwnerViewEditor,
      getLastSelectionForRoot,
      getMountedViewEditor,
      getView,
      mountAuthoredFragmentView,
      registerContentRootOwner,
      registerViewEffect,
      registerViewEditor,
      runtime,
      selectorContext,
      setActiveViewEditor,
    }),
    [
      focusVersion,
      focused,
      getActiveContentRootOwner,
      getAuthoredFragmentView,
      getContentRootOwnerViewEditor,
      getLastSelectionForRoot,
      getMountedViewEditor,
      getView,
      mountAuthoredFragmentView,
      registerContentRootOwner,
      registerViewEffect,
      registerViewEditor,
      runtime,
      selectorContext,
      setActiveViewEditor,
    ]
  );

  return (
    <PliteRuntimeContext
      value={value as unknown as PliteRuntimeContextValue<any, any>}
    >
      <EditorAnnouncementLiveRegion editor={runtime} />
      {children}
    </PliteRuntimeContext>
  );
}

/**
 * Subscribe to a selected value from the root runtime editor state.
 *
 * Use this for toolbar, sidebar, and shell UI that reads the whole editor
 * runtime. Use `useRootState` for root-scoped UI in multi-root editors.
 * Inline selectors observe current render values. Use `shouldUpdate` when a
 * commit can be skipped before the selector runs.
 */
export function useRuntimeState<T>(
  selector: (state: EditorStateView<any, any>) => T,
  {
    deferred,
    equalityFn = refEquality,
    shouldUpdate,
  }: RuntimeStateSelectorOptions<T> = {}
): T {
  const { runtime, selectorContext } = useRequiredPliteRuntimeContext();
  const stateSelector = useCallback(
    () =>
      runtime.read((state) =>
        selector(state as unknown as EditorStateView<any, any>)
      ),
    [runtime, selector]
  );
  const [selectedState, update] = useGenericSelector(stateSelector, equalityFn);
  const shouldUpdateRef = useRef(shouldUpdate);

  useIsomorphicLayoutEffect(() => {
    const changed = shouldUpdateRef.current !== shouldUpdate;

    shouldUpdateRef.current = shouldUpdate;

    if (changed) update();
  }, [shouldUpdate, update]);

  const shouldUpdateCommit = useCallback(
    (change?: EditorCommit) => shouldUpdateRef.current?.(change) ?? true,
    []
  );

  // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- The registration returns the unsubscribe function used by this effect's cleanup.
  useIsomorphicLayoutEffect(() => {
    const unsubscribe = selectorContext.addEventListener(update, {
      deferred,
      shouldUpdate: shouldUpdateCommit,
    });

    update();

    return unsubscribe;
  }, [deferred, selectorContext, shouldUpdateCommit, update]);

  return selectedState;
}

/**
 * Subscribe to a selected value from one root.
 *
 * Root-scoped selectors skip commits that cannot affect the requested root.
 * Use this for chrome tied to a known root, such as headers, sidebars, and
 * nested content roots. Use `useRuntimeState` only when the selected value
 * genuinely spans roots.
 */
export function useRootState<T, const TRoot extends RootKey = RootKey>(
  root: NamedRootKey<TRoot> | undefined,
  selector: (state: EditorStateView<any, any>) => T,
  {
    deferred,
    equalityFn = refEquality,
    shouldUpdate,
  }: RuntimeStateSelectorOptions<T> = {}
): T {
  if (root === MAIN_ROOT_KEY) {
    throw new Error(
      '[Plite] Omit root to read the primary document root state.'
    );
  }

  const { getView, selectorContext } = useRequiredPliteRuntimeContext();
  const internalRoot = root ?? MAIN_ROOT_KEY;
  const stateSelector = useCallback(
    () =>
      getView({ root }).read((state) =>
        selector(state as unknown as EditorStateView<any, any>)
      ),
    [getView, root, selector]
  );
  const [selectedState, update] = useGenericSelector(stateSelector, equalityFn);
  const shouldUpdateRef = useRef(shouldUpdate);

  useIsomorphicLayoutEffect(() => {
    const changed = shouldUpdateRef.current !== shouldUpdate;

    shouldUpdateRef.current = shouldUpdate;

    if (changed) update();
  }, [shouldUpdate, update]);

  const shouldUpdateView = useCallback(
    (change?: EditorCommit) => {
      if (!isRootAffected(internalRoot, change)) {
        return false;
      }

      return shouldUpdateRef.current ? shouldUpdateRef.current(change) : true;
    },
    [internalRoot]
  );

  // oxlint-disable-next-line react-doctor/effect-needs-cleanup -- The registration returns the unsubscribe function used by this effect's cleanup.
  useIsomorphicLayoutEffect(() => {
    const unsubscribe = selectorContext.addEventListener(update, {
      deferred,
      shouldUpdate: shouldUpdateView,
    });

    update();

    return unsubscribe;
  }, [deferred, selectorContext, shouldUpdateView, update]);

  return selectedState;
}

const usePliteInternalActiveRoot = (): RootKey =>
  useRuntimeState(selectActiveRoot, {
    equalityFn: rootKeyEquality,
    shouldUpdate: selectionChanged,
  });

/** Read the root key that currently owns the editor selection. */
export function useActiveRoot(): RootKey | undefined {
  return useRuntimeState(selectPublicActiveRoot, {
    equalityFn: rootKeyEquality,
    shouldUpdate: selectionChanged,
  });
}

/** Options for creating a root-specific command editor. */
export type UseRootEditorOptions = {
  readOnly?: boolean;
};

/** Command-capable editor view bound to one editor root. */
export type RootEditor<
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly [],
> = ReactEditorType<V, TPlugins> &
  ReactRuntimeEditor<V, TPlugins> &
  Omit<EditorView<V, TPlugins>, 'api' | 'plugin' | 'read' | 'update'>;

export function createPliteRootEditor<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly [],
>(
  {
    getView,
    runtime,
  }: Pick<PliteRuntimeContextValue<V, TPlugins>, 'getView' | 'runtime'>,
  root?: NamedRootKey,
  readOnly?: boolean
): RootEditor<V, TPlugins> {
  const editor = createReactRuntimeViewEditor(
    getView({ readOnly, root })
  ) as RootEditor<V, TPlugins>;
  setPliteViewSelectionStoreKey(editor, runtime);
  return editor;
}

/**
 * Create a command-capable editor for one root.
 *
 * The returned object is stable for the requested root and read-only option.
 * Use it for root-specific toolbar/sidebar commands. Pass `readOnly: true`
 * when UI only needs read APIs.
 */
export function useRootEditor<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly [],
  const TRoot extends RootKey = RootKey,
>(
  root?: NamedRootKey<TRoot>,
  options: UseRootEditorOptions = {}
): RootEditor<V, TPlugins> {
  if (root === MAIN_ROOT_KEY) {
    throw new Error(
      '[Plite] Omit root to create an editor for the primary document.'
    );
  }

  const { getView, runtime } = useRequiredPliteRuntimeContext<V, TPlugins>();
  const parentEditor = useOptionalEditorContext();

  return useMemo(() => {
    const editor = createPliteRootEditor<V, TPlugins>(
      { getView, runtime },
      root,
      options.readOnly
    );
    if (parentEditor) setPliteViewSelectionStoreKey(editor, parentEditor);
    return editor;
  }, [getView, options.readOnly, root, runtime, parentEditor]);
}

/**
 * Create a command-capable editor for the active root.
 *
 * Prefer `useRootEditor(root)` when the caller already knows the root.
 */
export function useActiveEditor<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly [],
>(): RootEditor<V, TPlugins> {
  return useRootEditor<V, TPlugins>(
    toPublicRootOption(usePliteInternalActiveRoot())
  );
}

/** Options for effects that run with a mounted root editor. */
export type UseRootEffectOptions<TRoot extends RootKey = RootKey> = {
  deps?: DependencyList;
  root?: NamedRootKey<TRoot>;
};

/** Focus behavior before or after root command callbacks. */
export type CommandFocusPolicy = 'none' | 'preserve' | 'restore-root';

/** Options for `usePliteCommand`. */
export type UseCommandOptions<TRoot extends RootKey = RootKey> = {
  focus?: CommandFocusPolicy;
  root?: NamedRootKey<TRoot>;
};

const usePliteResolvedRoot = (root: NamedRootKey | undefined): RootKey => {
  if (root === MAIN_ROOT_KEY) {
    throw new Error('[Plite] Omit root to target the primary document.');
  }

  const editableRoot = useContext(PliteEditableRootContext);
  const activeRoot = usePliteInternalActiveRoot();

  return root ?? editableRoot ?? activeRoot;
};

const useLatestCallbackCell = <T extends (...args: any[]) => any>(
  callback: T
) => {
  const cell = useRef(callback);

  useIsomorphicLayoutEffect(() => {
    cell.current = callback;
  }, [callback, cell]);

  return cell;
};

/**
 * Run an effect with the mounted editor for a root after Plite root effects
 * flush.
 *
 * Use this for commands or measurements that need mounted DOM/root bindings.
 * Pass `root` to target one root. Omit `deps` to rerun after every React render,
 * or pass `deps` for React-style rerun control.
 */
export function useRootEffect<
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly [],
  const TRoot extends RootKey = RootKey,
>(
  effect: (editor: RootEditor<V, TPlugins>) => void | (() => void),
  options: UseRootEffectOptions<TRoot> = {}
) {
  const { deps, root } = options;
  const resolvedRoot = usePliteResolvedRoot(root);
  const publicRoot = toPublicRootOption(resolvedRoot);
  const { getMountedViewEditor, registerViewEffect } =
    useRequiredPliteRuntimeContext();
  const fallbackEditor = useRootEditor<V, TPlugins>(publicRoot);
  const effectCell = useLatestCallbackCell(effect);
  const [cleanupCell] = useState<{
    current: void | (() => void);
  }>(() => ({ current: undefined }));
  const effectDeps =
    deps === undefined
      ? undefined
      : [
          cleanupCell,
          effectCell,
          fallbackEditor,
          getMountedViewEditor,
          registerViewEffect,
          resolvedRoot,
          ...deps,
        ];

  useIsomorphicLayoutEffect(
    () => {
      const unregister = registerViewEffect(() => {
        cleanupCell.current?.();
        cleanupCell.current = undefined;

        const mountedEditor =
          (getMountedViewEditor(resolvedRoot) as unknown) ?? fallbackEditor;
        const cleanup = effectCell.current(
          mountedEditor as RootEditor<V, TPlugins>
        );

        cleanupCell.current = cleanup;
      });

      return () => {
        unregister();
        cleanupCell.current?.();
        cleanupCell.current = undefined;
      };
    },
    // Omitted `deps` keeps normal effect semantics: rerun after every React
    // render. Explicit `deps` keeps hook-owned cells stable while letting
    // callers opt into precise React-only reruns.
    effectDeps
  );
}

type CommandArgs<TCommand extends EditorCommandDescriptor> = [
  EditorCommandInput<TCommand>,
] extends [void]
  ? [] | [input: EditorCommandInput<TCommand>]
  : [input: EditorCommandInput<TCommand>];

/** Typed dispatcher returned for one semantic command descriptor. */
export type CommandDispatcher<TCommand extends EditorCommandDescriptor> = (
  ...input: CommandArgs<TCommand>
) => boolean;

/**
 * Bind one semantic command to the mounted editor for a root.
 *
 * Command input belongs to the returned dispatcher, so event-time data never
 * becomes hook configuration. Pass `root` for a known root and use
 * `focus: 'restore-root'` when the command should first restore editor focus.
 */
export function useCommand<
  TCommand extends EditorCommandDescriptor,
  V extends Value = Value,
  const TPlugins extends readonly unknown[] = readonly [],
  const TRoot extends RootKey = RootKey,
>(
  command: TCommand &
    CompatibleEditorCommand<
      Editor<V, readonly [...TPlugins, DOMPlugin, ReactPlugin]>,
      TCommand
    >,
  options: UseCommandOptions<TRoot> = {}
): CommandDispatcher<TCommand> {
  const { focus = 'preserve', root } = options;
  const resolvedRoot = usePliteResolvedRoot(root);
  const publicRoot = toPublicRootOption(resolvedRoot);
  const context = useRequiredPliteRuntimeContext();
  const fallbackEditor = useRootEditor<V, TPlugins>(publicRoot);

  return useCallback(
    (...input: CommandArgs<TCommand>) => {
      const mountedEditor =
        (context.getMountedViewEditor(resolvedRoot) as unknown) ??
        fallbackEditor;
      const commandEditor = mountedEditor as RootEditor<V, TPlugins>;

      if (focus === 'restore-root') {
        focusPliteEditable(commandEditor);
      }

      return dispatchCommand(
        commandEditor as unknown as Editor,
        command,
        ...input
      );
    },
    [command, context, fallbackEditor, focus, resolvedRoot]
  );
}
