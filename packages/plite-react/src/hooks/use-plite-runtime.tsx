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
  createEditorView,
  type EditorCommandDescriptor,
  type EditorCommandInput,
  type EditorCommit,
  type EditorStateView,
  type EditorView,
  type EditorViewOptions,
  type ExtensionsOf,
  type NamedRootKey,
  type Path,
  type RootKey,
  type Selection,
  type Value,
  type ValueOf,
} from '@platejs/plite';
import type { DOMApi } from '@platejs/plite-dom';
import {
  createDOMEditorCapability,
  DOM_CLIPBOARD_HANDLERS,
  EDITOR_TO_ROOT_VIEW_EDITORS,
} from '@platejs/plite-dom/internal';

import { PliteEditableRootContext } from '../context';
import { refreshEditorDecorations } from '../decoration-refresh';
import {
  getEditorRuntime,
  getEditorRuntimeOwner,
  inheritEditorExtensionRegistry,
  getEditorExtensionContributions,
  setEditorRuntime,
  getLastCommit as editorGetLastCommit,
  getSnapshot as editorGetSnapshot,
} from '../editable/runtime-editor-api';
import {
  type ReactRuntimeEditor,
  toReactRuntimeEditor,
} from '../plugin/react-editor';
import {
  type CreateReactEditorOptions,
  createReactEditor,
  type ReactEditor as ReactEditorType,
} from '../plugin/with-react';
import type { PliteProjectionStoreRefreshOptions } from '../projection-store';
import { MAIN_ROOT_KEY, toPublicRootOption } from '../root-key';
import { EditorAnnouncementLiveRegion } from '../components/editor-announcement-live-region';
import { REACT_MAJOR_VERSION } from '../utils/environment';
import { setPliteViewSelectionStoreKey } from '../view-selection';
import { focusPliteEditable } from './focus-plite-editable';
import {
  createRootSelectionCache,
  getSelectionRoot,
} from './root-selection-cache';
import { getSchemaInvalidatedRuntimeIds } from '../editable/schema-runtime-invalidation';
import {
  type EditorSelectorContextValue,
  useEditorSelectorContext,
} from './use-editor-selector';
import { useGenericSelector } from './use-generic-selector';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';
import {
  syncChangedTextToDOM,
  syncPliteNodePathBindingsToDOM,
} from './use-plite-node-ref';
import { useRuntimeFocusState } from './use-runtime-focus-state';

const refEquality = <T,>(a: T | null, b: T) => a === b;
const rootKeyEquality = (
  a: RootKey | null | undefined,
  b: RootKey | undefined
) => a === b;
const selectionChanged = (change?: EditorCommit) =>
  Boolean(change?.selectionChanged);

const selectActiveRoot = (state: EditorStateView): RootKey => {
  const selection = state.selection();

  return getSelectionRoot(selection) ?? MAIN_ROOT_KEY;
};

const selectPublicActiveRoot = (state: EditorStateView): RootKey | undefined =>
  toPublicRootOption(selectActiveRoot(state));

type ExtensionLike = {
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

const createReactApi = (editor: object, domApi: DOMApi) =>
  Object.freeze({
    refreshDecorations: (options?: PliteProjectionStoreRefreshOptions) => {
      refreshEditorDecorations(editor, {
        ...options,
        reason: options?.reason ?? 'external',
        requiresDOMSelectionExport:
          options?.requiresDOMSelectionExport ?? domApi.isFocused(),
      });
    },
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

/** Runtime object shared by Plite React roots and runtime-aware hooks. */
export type PliteRuntimeValue<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = Pick<
  ReactEditorType<V, TExtensions>,
  | 'anchor'
  | 'api'
  | 'extension'
  | 'install'
  | 'read'
  | 'subscribe'
  | 'subscribeCommit'
  | 'update'
> & {
  editor: ReactEditorType<V, TExtensions>;
};

/** Options used when creating a component-owned Plite runtime. */
export type UsePliteRuntimeOptions<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = CreateReactEditorOptions<V, TExtensions>;

type PliteRuntimeContextValue<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = {
  focusVersion: number;
  focused: boolean;
  getActiveContentRootOwner: (root: RootKey) => PliteContentRootOwner | null;
  getContentRootOwnerViewEditor: (
    owner: PliteContentRootOwner
  ) => ReactRuntimeEditor<
    V,
    ExtensionsOf<ReactEditorType<V, TExtensions>>
  > | null;
  getLastSelectionForRoot: (root: RootKey) => Selection;
  getMountedViewEditor: (
    root: RootKey
  ) => ReactRuntimeEditor<
    V,
    ExtensionsOf<ReactEditorType<V, TExtensions>>
  > | null;
  getView: (
    options?: EditorViewOptions
  ) => EditorView<V, ExtensionsOf<ReactEditorType<V, TExtensions>>>;
  registerContentRootOwner: (
    editor: ReactRuntimeEditor<
      V,
      ExtensionsOf<ReactEditorType<V, TExtensions>>
    >,
    owner: PliteContentRootOwner
  ) => () => void;
  registerViewEffect: (effect: () => void) => () => void;
  registerViewEditor: (
    editor: ReactRuntimeEditor<
      V,
      ExtensionsOf<ReactEditorType<V, TExtensions>>
    >,
    root: RootKey
  ) => () => void;
  runtime: PliteRuntimeValue<V, TExtensions>;
  selectorContext: EditorSelectorContextValue;
  setActiveViewEditor: (
    editor: ReactRuntimeEditor<
      V,
      ExtensionsOf<ReactEditorType<V, TExtensions>>
    >,
    root: RootKey
  ) => void;
};

/** Props for the `<PliteRuntime>` provider. */
export type PliteRuntimeProps<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = {
  children: ReactNode;
  runtime: PliteRuntimeValue<V, TExtensions>;
};

/** Selector options for `usePliteRuntimeState` and `usePliteRootState`. */
export type PliteRuntimeStateSelectorOptions<
  T,
  TRuntime extends PliteRuntimeValue<any, any> = PliteRuntimeValue<any, any>,
> = {
  deferred?: boolean;
  equalityFn?: (a: T | null, b: T) => boolean;
  shouldUpdate?: (
    change?: EditorCommit<ValueOf<TRuntime['editor']>>
  ) => boolean;
};

export const PliteRuntimeContext = createContext<PliteRuntimeContextValue<
  any,
  any
> | null>(null);

const createReactRuntime = <
  V extends Value,
  TExtensions extends readonly unknown[] = readonly [],
>(
  options: UsePliteRuntimeOptions<V, TExtensions> = {}
): PliteRuntimeValue<V, TExtensions> => {
  const editor = createReactEditor(options);

  return Object.freeze({
    api: editor.api,
    anchor: editor.anchor,
    editor,
    extension: editor.extension,
    install: editor.install,
    read: editor.read,
    subscribe: editor.subscribe,
    subscribeCommit: editor.subscribeCommit,
    update: editor.update,
  });
};

export type ReactRuntimeViewEditor<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = ReactRuntimeEditor<V, TExtensions> & EditorView<V, TExtensions>;

export const createReactRuntimeViewEditor = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly unknown[],
>(
  view: EditorView<V, TExtensions>
): ReactRuntimeViewEditor<V, TExtensions> => {
  const runtime = getEditorRuntime(view as any);
  const runtimeOwner = getEditorRuntimeOwner(view as any);
  const {
    api: _api,
    extension: _extension,
    ...descriptors
  } = Object.getOwnPropertyDescriptors(view);
  const editor = Object.create(Object.getPrototypeOf(view)) as EditorView<
    V,
    TExtensions
  >;

  Object.defineProperties(editor, descriptors);
  setEditorRuntime(editor as any, runtime, runtimeOwner);
  inheritEditorExtensionRegistry(editor as any, view as any);

  const { clipboard, ...domApi } = createDOMEditorCapability(
    toReactRuntimeEditor(editor),
    getEditorExtensionContributions(editor as any, DOM_CLIPBOARD_HANDLERS)
  );
  const reactApi = createReactApi(editor, domApi);
  const scopedDomApi = Object.freeze({ ...domApi, clipboard });
  const baseApi = view.api as Record<PropertyKey, unknown>;
  const viewApi = new Proxy(baseApi, {
    get(target, property, receiver) {
      if (property === 'dom') {
        return scopedDomApi;
      }
      if (property === 'react') {
        return reactApi;
      }

      return Reflect.get(target, property, receiver);
    },
  }) as ReactRuntimeEditor<V, TExtensions>['api'];

  Object.defineProperties(editor, {
    api: {
      enumerable: true,
      value: viewApi,
    },
    extension: {
      enumerable: true,
      value: ((extension: ExtensionLike) => {
        const portal = (
          view.extension as unknown as (extension: ExtensionLike) => {
            api: unknown;
            read: unknown;
            update: unknown;
          }
        )(extension);
        const rebound = Reflect.get(viewApi, extension.name);

        return rebound === undefined
          ? portal
          : Object.freeze({
              get api() {
                return rebound;
              },
              get read() {
                return portal.read;
              },
              get update() {
                return portal.update;
              },
            });
      }) as unknown as typeof view.extension,
    },
  });

  return Object.freeze(editor) as ReactRuntimeViewEditor<V, TExtensions>;
};

const isRootAffected = (root: RootKey, change?: EditorCommit) =>
  !change || change.changed.has('snapshot', toPublicRootOption(root));

/**
 * Create or read the current Plite runtime.
 *
 * With no options inside `<PliteRuntime>`, the hook returns the provided
 * runtime. Pass options to create a component-owned runtime once.
 */
export function usePliteRuntime<
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>(
  options?: UsePliteRuntimeOptions<V, TExtensions>
): PliteRuntimeValue<V, TExtensions> {
  const context = useContext(PliteRuntimeContext);
  const shouldUseContext = context && !options;
  const [runtime] = useState(() =>
    shouldUseContext ? null : createReactRuntime(options ?? {})
  );

  return (shouldUseContext
    ? context.runtime
    : runtime) as unknown as PliteRuntimeValue<V, TExtensions>;
}

export function useOptionalPliteRuntimeContext() {
  return useContext(PliteRuntimeContext);
}

export function useRequiredPliteRuntimeContext() {
  const context = useContext(PliteRuntimeContext);

  if (!context) {
    throw new Error('Plite roots must be rendered inside <PliteRuntime>.');
  }

  return context;
}

/**
 * Provide a Plite runtime to editable roots and runtime-aware hooks.
 *
 * The provider owns selector delivery, root editor registration, focus state,
 * view effects, and active-root/editor resolution for descendant surfaces.
 */
export function PliteRuntime<
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>(props: PliteRuntimeProps<V, TExtensions>) {
  const parent = useOptionalPliteRuntimeContext();

  if (
    parent &&
    getEditorRuntimeOwner(parent.runtime.editor) ===
      getEditorRuntimeOwner(props.runtime.editor)
  ) {
    return <>{props.children}</>;
  }

  return <OwnedPliteRuntime {...props} />;
}

function OwnedPliteRuntime<
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>({ children, runtime }: PliteRuntimeProps<V, TExtensions>) {
  const { selectorContext, onChange: handleSelectorChange } =
    useEditorSelectorContext();
  const lastCommitVersionRef = useRef(
    editorGetLastCommit(runtime.editor)?.version ?? 0
  );
  const reactEditor = toReactRuntimeEditor(runtime.editor);
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
  const activeContentRootOwnersRef = useRef(
    new Map<RootKey, PliteContentRootOwner>()
  );
  const [viewEffectQueue] = useState(createPliteViewEffectQueue);
  const [viewEffectVersion, setViewEffectVersion] = useState(0);
  const lastSelectionCacheRef = useRef(createRootSelectionCache());
  const { focused, focusVersion, refreshFocused } =
    useRuntimeFocusState(reactEditor);

  const getView = useCallback(
    (options: EditorViewOptions = {}) =>
      createEditorView(runtime.editor, options),
    [runtime]
  );
  const registerViewEditor = useCallback(
    (editor: typeof reactEditor, root: RootKey) => {
      const viewEditors = mountedViewEditorsRef.current.get(root) ?? new Set();
      const rootViewEditors =
        EDITOR_TO_ROOT_VIEW_EDITORS.get(runtime.editor) ?? new Set();

      viewEditors.add(editor);
      mountedViewEditorsRef.current.set(root, viewEditors);
      if (!activeViewEditorsRef.current.has(root)) {
        activeViewEditorsRef.current.set(root, editor);
      }
      rootViewEditors.add(editor);
      EDITOR_TO_ROOT_VIEW_EDITORS.set(runtime.editor, rootViewEditors);

      return () => {
        viewEditors.delete(editor);
        rootViewEditors.delete(editor);
        const owner = contentRootOwnersRef.current.get(editor);

        contentRootOwnersRef.current.delete(editor);
        if (owner) {
          contentRootOwnerViewEditorsRef.current.delete(
            getContentRootOwnerKey(owner)
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
          EDITOR_TO_ROOT_VIEW_EDITORS.delete(runtime.editor);
        }
      };
    },
    [runtime.editor]
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
          contentRootOwnerViewEditorsRef.current.delete(
            getContentRootOwnerKey(owner)
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
    (root: RootKey) => lastSelectionCacheRef.current.get(root),
    []
  );
  const registerViewEffect = useCallback(
    (effect: () => void) => {
      const unregister = viewEffectQueue.register(effect);

      setViewEffectVersion((version) => version + 1);

      return unregister;
    },
    [viewEffectQueue]
  );
  const syncRuntimeChangesToDOM = useCallback((commit: EditorCommit) => {
    if (mountedViewEditorsRef.current.size === 0) {
      return { changedTextCount: 0, syncedTextCount: 0 };
    }

    let changedTextCount = 0;
    let syncedTextCount = 0;

    for (const [root, viewEditors] of mountedViewEditorsRef.current) {
      const publicRoot = toPublicRootOption(root);
      const changedTextRuntimeIds = commit.changed.runtimeIds(
        'text',
        publicRoot
      );
      const changedPathRuntimeIds = commit.changed.runtimeIds(
        'path',
        publicRoot
      );
      let didSyncEveryView = changedTextRuntimeIds.length > 0;

      for (const viewEditor of viewEditors) {
        const textSync = syncChangedTextToDOM(
          viewEditor,
          changedTextRuntimeIds
        );

        if (textSync.syncedTextCount < textSync.changedTextCount) {
          didSyncEveryView = false;
        }
        if (changedPathRuntimeIds.length > 0) {
          syncPliteNodePathBindingsToDOM(viewEditor, changedPathRuntimeIds);
        }
      }

      changedTextCount += changedTextRuntimeIds.length;
      if (didSyncEveryView) syncedTextCount += changedTextRuntimeIds.length;
    }

    return { changedTextCount, syncedTextCount };
  }, []);

  useIsomorphicLayoutEffect(() => {
    const maybeBatchUpdates =
      REACT_MAJOR_VERSION < 18
        ? ReactDOM.unstable_batchedUpdates
        : (callback: () => void) => callback();

    const onContextChange: Parameters<typeof runtime.subscribeCommit>[0] = (
      commit
    ) => {
      lastSelectionCacheRef.current.record(
        commit.selectionAfter,
        commit.selectionAfterRoot
      );

      lastCommitVersionRef.current = commit.version;

      maybeBatchUpdates(() => {
        refreshFocused();

        const textSync = syncRuntimeChangesToDOM(commit);
        const hasUnsyncedTextChange =
          commit.changed.hasAny('text') &&
          textSync.changedTextCount > textSync.syncedTextCount;

        handleSelectorChange(
          hasUnsyncedTextChange ? undefined : commit,
          getSchemaInvalidatedRuntimeIds(runtime.editor, commit)
        );

        if (viewEffectQueue.hasEffects()) {
          setViewEffectVersion((version) => version + 1);
        }
      });
    };

    const unsubscribe = runtime.subscribeCommit(onContextChange);
    const latestCommit = editorGetLastCommit(runtime.editor);

    if (latestCommit && latestCommit.version > lastCommitVersionRef.current) {
      onContextChange(latestCommit, editorGetSnapshot(runtime.editor));
    }

    return unsubscribe;
  }, [
    handleSelectorChange,
    reactEditor,
    refreshFocused,
    runtime,
    syncRuntimeChangesToDOM,
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
      getContentRootOwnerViewEditor,
      getLastSelectionForRoot,
      getMountedViewEditor,
      getView,
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
      getContentRootOwnerViewEditor,
      getLastSelectionForRoot,
      getMountedViewEditor,
      getView,
      registerContentRootOwner,
      registerViewEffect,
      registerViewEditor,
      runtime,
      selectorContext,
      setActiveViewEditor,
    ]
  );

  return (
    <PliteRuntimeContext.Provider
      value={value as PliteRuntimeContextValue<any, any>}
    >
      <EditorAnnouncementLiveRegion editor={runtime.editor} />
      {children}
    </PliteRuntimeContext.Provider>
  );
}

/**
 * Subscribe to a selected value from the root runtime editor state.
 *
 * Use this for toolbar, sidebar, and shell UI that reads the whole editor
 * runtime. Use `usePliteRootState` for root-scoped UI in multi-root editors.
 * Inline selectors observe current render values. Use `shouldUpdate` when a
 * commit can be skipped before the selector runs.
 */
export function usePliteRuntimeState<
  T,
  TRuntime extends PliteRuntimeValue<any, any> = PliteRuntimeValue<any, any>,
>(
  selector: (
    state: EditorStateView<
      ValueOf<TRuntime['editor']>,
      ExtensionsOf<TRuntime['editor']>
    >
  ) => T,
  {
    deferred,
    equalityFn = refEquality,
    shouldUpdate,
  }: PliteRuntimeStateSelectorOptions<T, TRuntime> = {}
): T {
  const { runtime, selectorContext } = useRequiredPliteRuntimeContext();
  const stateSelector = useCallback(
    () =>
      runtime.read((state) =>
        selector(
          state as EditorStateView<
            ValueOf<TRuntime['editor']>,
            ExtensionsOf<TRuntime['editor']>
          >
        )
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
    (change?: EditorCommit) =>
      shouldUpdateRef.current?.(
        change as EditorCommit<ValueOf<TRuntime['editor']>> | undefined
      ) ?? true,
    []
  );

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
 * nested content roots. Use `usePliteRuntimeState` only when the selected value
 * genuinely spans roots.
 */
export function usePliteRootState<
  T,
  TRuntime extends PliteRuntimeValue<any, any> = PliteRuntimeValue<any, any>,
  const TRoot extends RootKey = RootKey,
>(
  root: NamedRootKey<TRoot> | undefined,
  selector: (
    state: EditorStateView<
      ValueOf<TRuntime['editor']>,
      ExtensionsOf<TRuntime['editor']>
    >
  ) => T,
  {
    deferred,
    equalityFn = refEquality,
    shouldUpdate,
  }: PliteRuntimeStateSelectorOptions<T, TRuntime> = {}
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
        selector(
          state as EditorStateView<
            ValueOf<TRuntime['editor']>,
            ExtensionsOf<TRuntime['editor']>
          >
        )
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

      return shouldUpdateRef.current
        ? shouldUpdateRef.current(
            change as EditorCommit<ValueOf<TRuntime['editor']>> | undefined
          )
        : true;
    },
    [internalRoot]
  );

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
  usePliteRuntimeState(selectActiveRoot, {
    equalityFn: rootKeyEquality,
    shouldUpdate: selectionChanged,
  });

/** Read the root key that currently owns the editor selection. */
export function usePliteActiveRoot(): RootKey | undefined {
  return usePliteRuntimeState(selectPublicActiveRoot, {
    equalityFn: rootKeyEquality,
    shouldUpdate: selectionChanged,
  });
}

/** Options for creating a root-specific command editor. */
export type UsePliteRootEditorOptions = {
  readOnly?: boolean;
};

/** Command-capable editor view bound to one Plite root. */
export type PliteRootEditor<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = ReactEditorType<V, TExtensions> &
  ReactRuntimeEditor<V, TExtensions> &
  Omit<EditorView<V, TExtensions>, 'api' | 'extension' | 'read' | 'update'>;

/**
 * Create a command-capable editor for one root.
 *
 * The returned object is stable for the requested root and read-only option.
 * Use it for root-specific toolbar/sidebar commands. Pass `readOnly: true`
 * when UI only needs read APIs.
 */
export function usePliteRootEditor<
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
  const TRoot extends RootKey = RootKey,
>(
  root?: NamedRootKey<TRoot>,
  options: UsePliteRootEditorOptions = {}
): PliteRootEditor<V, TExtensions> {
  if (root === MAIN_ROOT_KEY) {
    throw new Error(
      '[Plite] Omit root to create an editor for the primary document.'
    );
  }

  const { getView, runtime } = useRequiredPliteRuntimeContext();

  return useMemo(() => {
    const viewEditor = createReactRuntimeViewEditor(
      getView({ readOnly: options.readOnly, root }) as EditorView<
        V,
        TExtensions
      >
    ) as PliteRootEditor<V, TExtensions>;

    setPliteViewSelectionStoreKey(viewEditor, runtime.editor);

    return viewEditor;
  }, [getView, options.readOnly, root, runtime.editor]);
}

/**
 * Create a command-capable editor for the active root.
 *
 * Prefer `usePliteRootEditor(root)` when the caller already knows the root.
 */
export function usePliteActiveEditor<
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>(): PliteRootEditor<V, TExtensions> {
  return usePliteRootEditor<V, TExtensions>(
    toPublicRootOption(usePliteInternalActiveRoot())
  );
}

/** Options for effects that run with a mounted root editor. */
export type UsePliteRootEffectOptions<TRoot extends RootKey = RootKey> = {
  deps?: DependencyList;
  root?: NamedRootKey<TRoot>;
};

/** Focus behavior before or after root command callbacks. */
export type PliteCommandFocusPolicy = 'none' | 'preserve' | 'restore-root';

/** Options for `usePliteCommand`. */
export type UsePliteCommandOptions<TRoot extends RootKey = RootKey> = {
  focus?: PliteCommandFocusPolicy;
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
  const [cell] = useState(() => ({ current: callback }));

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
export function usePliteRootEffect<
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
  const TRoot extends RootKey = RootKey,
>(
  effect: (editor: PliteRootEditor<V, TExtensions>) => void | (() => void),
  options: UsePliteRootEffectOptions<TRoot> = {}
) {
  const { deps, root } = options;
  const resolvedRoot = usePliteResolvedRoot(root);
  const publicRoot = toPublicRootOption(resolvedRoot);
  const { getMountedViewEditor, registerViewEffect } =
    useRequiredPliteRuntimeContext();
  const fallbackEditor = usePliteRootEditor<V, TExtensions>(publicRoot);
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
          getMountedViewEditor(resolvedRoot) ?? fallbackEditor;
        const cleanup = effectCell.current(
          mountedEditor as PliteRootEditor<V, TExtensions>
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

type PliteCommandArgs<TCommand extends EditorCommandDescriptor> = [
  EditorCommandInput<TCommand>,
] extends [void]
  ? [] | [input: EditorCommandInput<TCommand>]
  : [input: EditorCommandInput<TCommand>];

/** Typed dispatcher returned for one semantic command descriptor. */
export type PliteCommandDispatcher<TCommand extends EditorCommandDescriptor> = (
  ...input: PliteCommandArgs<TCommand>
) => boolean;

/**
 * Bind one semantic command to the mounted editor for a root.
 *
 * Command input belongs to the returned dispatcher, so event-time data never
 * becomes hook configuration. Pass `root` for a known root and use
 * `focus: 'restore-root'` when the command should first restore editor focus.
 */
export function usePliteCommand<
  TCommand extends EditorCommandDescriptor,
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
  const TRoot extends RootKey = RootKey,
>(
  command: TCommand &
    CompatibleEditorCommand<ReactEditorType<V, TExtensions>, TCommand>,
  options: UsePliteCommandOptions<TRoot> = {}
): PliteCommandDispatcher<TCommand> {
  const { focus = 'preserve', root } = options;
  const resolvedRoot = usePliteResolvedRoot(root);
  const publicRoot = toPublicRootOption(resolvedRoot);
  const context = useRequiredPliteRuntimeContext();
  const fallbackEditor = usePliteRootEditor<V, TExtensions>(publicRoot);

  return useCallback(
    (...input: PliteCommandArgs<TCommand>) => {
      const mountedEditor =
        context.getMountedViewEditor(resolvedRoot) ?? fallbackEditor;
      const commandEditor = mountedEditor as PliteRootEditor<V, TExtensions>;

      if (focus === 'restore-root') {
        focusPliteEditable(commandEditor);
      }

      const typedEditor: ReactEditorType<V, TExtensions> = commandEditor;

      return typedEditor.update.command<TCommand>(command, ...input);
    },
    [command, context, fallbackEditor, focus, resolvedRoot]
  );
}
