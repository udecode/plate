import React, {
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
  type EditorStateView,
  type EditorView,
  type EditorViewOptions,
  type PluginsOf,
  type NamedRootKey,
  type Path,
  type RootKey,
  SelectionApi,
  type Value,
  type ValueOf,
} from '../..';
import {
  createEditorCommitPublicationQueue,
  publishEditorCommitInVersionOrder,
} from '../../core/commit-publication';
import { releaseEditorViewLifetime } from '../../core/editor-view-lifetime';
import { createEditorViewPluginApis } from '../../core/plugin';
import type { ViewPresentation } from '../../core/view-presentation';
import type { DOMApi } from '../../dom';
import {
  createDOMEditorCapability,
  EDITOR_TO_ROOT_VIEW_EDITORS,
} from '../../dom/internal';
import {
  createEditorViewRuntime,
  getViewPresentation,
} from '../../editor-runtime-view';
import { EditorAnnouncementLiveRegion } from '../components/editor-announcement-live-region';
import { PliteEditableRootContext } from '../context';
import { getMountedEditableDOMRuntime } from '../editable/editable-dom-runtime';
import {
  getEditorRuntime,
  getEditorRuntimeOwner,
  inheritPluginRegistry,
  dispatchCommand,
  failInvariant,
  setEditorRuntime,
  getLastCommit as editorGetLastCommit,
  getSnapshot as editorGetSnapshot,
} from '../editable/runtime-editor-api';
import { getSchemaInvalidatedNodeKeys } from '../editable/schema-runtime-invalidation';
import { subscribeTypedText } from '../editable/typed-text';
import {
  type ReactRuntimeEditor,
  toReactRuntimeEditor,
} from '../plugin/react-editor';
import type { Editor as ReactEditorType, ReactApi } from '../plugin/with-react';
import { MAIN_ROOT_KEY, toPublicRootOption } from '../root-key';
import { REACT_MAJOR_VERSION } from '../utils/environment';
import { focusPliteEditable } from './focus-plite-editable';
import {
  type EditorSelectorContextValue,
  useEditorSelectorContext,
} from './use-editor-selector';
import { useGenericSelector } from './use-generic-selector';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

const refEquality = <T,>(a: T | null, b: T) => a === b;
const rootKeyEquality = (
  a: RootKey | null | undefined,
  b: RootKey | undefined
) => a === b;
const selectionChanged = (change?: EditorCommit) =>
  Boolean(change?.selectionChanged);

const selectActiveRoot = (state: ReactEditorState): RootKey => {
  const selection = state.selection();

  return SelectionApi.root(selection) ?? MAIN_ROOT_KEY;
};

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

const createReactApi = <V extends Value, TPlugins extends readonly unknown[]>(
  domApi: DOMApi,
  editor: ReactRuntimeEditor<V, TPlugins>
): ReactApi =>
  Object.freeze({
    isComposing: () => domApi.isComposing(),
    isFocused: () => domApi.isFocused(),
    isReadOnly: () => domApi.isReadOnly(),
    settleInput: () =>
      getMountedEditableDOMRuntime(editor)?.settleInput() ??
      !domApi.isComposing(),
    subscribeTypedText: (listener) => subscribeTypedText(editor, listener),
  });

type MountedViewEditor = ReactRuntimeEditor<Value, PluginsOf<ReactEditorType>>;

type PliteRuntimeContextValue = {
  getActiveContentRootOwner: (root: RootKey) => PliteContentRootOwner | null;
  getContentRootOwnerViewEditor: (
    owner: PliteContentRootOwner
  ) => MountedViewEditor | null;
  getMountedViewEditor: (root: RootKey) => MountedViewEditor | null;
  getView: (
    options?: EditorViewOptions,
    presentation?: ViewPresentation
  ) => EditorView<Value, PluginsOf<ReactEditorType>>;
  presentation: ViewPresentation | null;
  registerContentRootOwner: (
    editor: MountedViewEditor,
    owner: PliteContentRootOwner
  ) => () => void;
  registerViewEditor: (editor: MountedViewEditor, root: RootKey) => () => void;
  runtime: ReactEditorType;
  selectorContext: EditorSelectorContextValue;
  setActiveViewEditor: (editor: MountedViewEditor, root: RootKey) => void;
};

type PresentationLookups = {
  getActiveContentRootOwner: (
    root: RootKey,
    presentation: ViewPresentation | null
  ) => PliteContentRootOwner | null;
  getContentRootOwnerViewEditor: (
    owner: PliteContentRootOwner,
    presentation: ViewPresentation | null
  ) => MountedViewEditor | null;
  getMountedViewEditor: (
    root: RootKey,
    presentation: ViewPresentation | null
  ) => MountedViewEditor | null;
};

type PliteRuntimeProviderValue = Omit<
  PliteRuntimeContextValue,
  keyof PresentationLookups | 'presentation'
> &
  PresentationLookups;

const scopeRuntimeContext = (
  provider: PliteRuntimeProviderValue,
  presentation: ViewPresentation | null
): PliteRuntimeContextValue => ({
  ...provider,
  getActiveContentRootOwner: (root) =>
    provider.getActiveContentRootOwner(root, presentation),
  getContentRootOwnerViewEditor: (owner) =>
    provider.getContentRootOwnerViewEditor(owner, presentation),
  getMountedViewEditor: (root) =>
    provider.getMountedViewEditor(root, presentation),
  presentation,
});

const presentationMap = <K, T>(
  maps: Map<ViewPresentation, Map<K, T>>,
  presentation: ViewPresentation
) => {
  let map = maps.get(presentation);

  if (!map) {
    map = new Map();
    maps.set(presentation, map);
  }

  return map;
};

const ProviderContext = createContext<PliteRuntimeProviderValue | null>(null);

export const SurfaceRuntimeScope = ({
  children,
  presentation,
}: {
  children: ReactNode;
  presentation: ViewPresentation | null;
}) => {
  const provider =
    useContext(ProviderContext) ??
    failInvariant('A mounted surface requires an editor runtime provider.');
  const value = useMemo(
    () => scopeRuntimeContext(provider, presentation),
    [presentation, provider]
  );

  return <PliteRuntimeContext value={value}>{children}</PliteRuntimeContext>;
};

/** Selector options for `useRuntimeState` and `useRootState`. */
export type RuntimeStateSelectorOptions<T> = {
  deferred?: boolean;
  equalityFn?: (a: T | null, b: T) => boolean;
  shouldUpdate?: (change?: EditorCommit) => boolean;
};

export const PliteRuntimeContext =
  createContext<PliteRuntimeContextValue | null>(null);

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
  const reactApi = createReactApi(domApi, toReactRuntimeEditor(editor));
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

export function useRequiredPliteRuntimeContext(): PliteRuntimeContextValue {
  const context = useContext(PliteRuntimeContext);

  if (!context) {
    throw new Error('Editor roots must be rendered inside <EditorRoot>.');
  }

  return context;
}

export function EditorRuntimeProvider({
  children,
  editor: runtime,
}: {
  children: ReactNode;
  editor: ReactEditorType;
}) {
  const { selectorContext, onChange: handleSelectorChange } =
    useEditorSelectorContext();
  const [commitPublicationQueue] = useState(() =>
    createEditorCommitPublicationQueue(
      editorGetLastCommit(runtime)?.version ?? 0
    )
  );
  const reactEditor = toReactRuntimeEditor(runtime);
  const mountedViewEditorsRef = useRef(
    new Map<RootKey, Set<typeof reactEditor>>()
  );
  const activeViewEditorsRef = useRef(
    new Map<ViewPresentation, Map<RootKey, typeof reactEditor>>()
  );
  const contentRootOwnersRef = useRef(
    new Map<typeof reactEditor, PliteContentRootOwner>()
  );
  const contentRootOwnerViewEditorsRef = useRef(
    new Map<ViewPresentation, Map<string, typeof reactEditor>>()
  );
  const activeContentRootOwnersRef = useRef(
    new Map<ViewPresentation, Map<RootKey, PliteContentRootOwner>>()
  );
  const getView = useCallback(
    (options: EditorViewOptions = {}, presentation?: ViewPresentation) =>
      createEditorViewRuntime(runtime, options, presentation),
    [runtime]
  );
  const findMountedViewEditor = useCallback(
    (root: RootKey, presentation: ViewPresentation | null) => {
      const viewEditors = mountedViewEditorsRef.current.get(root);

      if (!viewEditors) return null;
      if (presentation) {
        const active = activeViewEditorsRef.current
          .get(presentation)
          ?.get(root);

        if (active && viewEditors.has(active)) return active;
      }
      for (const viewEditor of viewEditors) {
        if (!presentation || getViewPresentation(viewEditor) === presentation) {
          return viewEditor;
        }
      }

      return null;
    },
    []
  );
  const registerViewEditor = useCallback(
    (editor: typeof reactEditor, root: RootKey) => {
      const presentation = getViewPresentation(editor);
      const viewEditors = mountedViewEditorsRef.current.get(root) ?? new Set();
      const rootViewEditors =
        EDITOR_TO_ROOT_VIEW_EDITORS.get(runtime) ?? new Set();
      const activeViewEditors = presentationMap(
        activeViewEditorsRef.current,
        presentation
      );

      viewEditors.add(editor);
      mountedViewEditorsRef.current.set(root, viewEditors);
      if (!activeViewEditors.has(root)) {
        activeViewEditors.set(root, editor);
      }
      rootViewEditors.add(editor);
      EDITOR_TO_ROOT_VIEW_EDITORS.set(runtime, rootViewEditors);

      return () => {
        releaseEditorViewLifetime(editor);
        viewEditors.delete(editor);
        rootViewEditors.delete(editor);
        const owner = contentRootOwnersRef.current.get(editor);
        const ownerViewEditors =
          contentRootOwnerViewEditorsRef.current.get(presentation);

        contentRootOwnersRef.current.delete(editor);
        if (owner && ownerViewEditors) {
          unregisterContentRootOwnerViewEditor(ownerViewEditors, owner, editor);
        }

        if (activeViewEditors.get(root) === editor) {
          activeViewEditors.delete(root);

          const nextEditor = findMountedViewEditor(root, presentation);

          if (nextEditor) activeViewEditors.set(root, nextEditor);
        }
        if (viewEditors.size === 0) {
          mountedViewEditorsRef.current.delete(root);
        }
        if (rootViewEditors.size === 0) {
          EDITOR_TO_ROOT_VIEW_EDITORS.delete(runtime);
        }
        const presentationStillMounted = [...rootViewEditors].some(
          (viewEditor) => getViewPresentation(viewEditor) === presentation
        );

        if (!presentationStillMounted) {
          activeViewEditorsRef.current.delete(presentation);
          contentRootOwnerViewEditorsRef.current.delete(presentation);
          activeContentRootOwnersRef.current.delete(presentation);
        }
      };
    },
    [findMountedViewEditor, runtime]
  );
  const setActiveViewEditor = useCallback(
    (editor: typeof reactEditor, root: RootKey) => {
      const viewEditors = mountedViewEditorsRef.current.get(root);

      if (viewEditors?.has(editor) || root === MAIN_ROOT_KEY) {
        const presentation = getViewPresentation(editor);

        presentationMap(activeViewEditorsRef.current, presentation).set(
          root,
          editor
        );
        const owner = contentRootOwnersRef.current.get(editor);

        if (owner) {
          presentationMap(activeContentRootOwnersRef.current, presentation).set(
            root,
            owner
          );
        }
      }
    },
    []
  );
  const registerContentRootOwner = useCallback(
    (editor: typeof reactEditor, owner: PliteContentRootOwner) => {
      const ownerViewEditors = presentationMap(
        contentRootOwnerViewEditorsRef.current,
        getViewPresentation(editor)
      );

      contentRootOwnersRef.current.set(editor, owner);
      ownerViewEditors.set(getContentRootOwnerKey(owner), editor);

      return () => {
        if (contentRootOwnersRef.current.get(editor) === owner) {
          contentRootOwnersRef.current.delete(editor);
          unregisterContentRootOwnerViewEditor(ownerViewEditors, owner, editor);
        }
      };
    },
    []
  );
  const getContentRootOwnerViewEditor = useCallback(
    (owner: PliteContentRootOwner, presentation: ViewPresentation | null) => {
      const key = getContentRootOwnerKey(owner);

      if (presentation) {
        return (
          contentRootOwnerViewEditorsRef.current.get(presentation)?.get(key) ??
          null
        );
      }
      for (const ownerViewEditors of contentRootOwnerViewEditorsRef.current.values()) {
        const viewEditor = ownerViewEditors.get(key);

        if (viewEditor) return viewEditor;
      }

      return null;
    },
    []
  );
  const getActiveContentRootOwner = useCallback(
    (root: RootKey, presentation: ViewPresentation | null) => {
      if (!presentation) return null;

      const activeOwner = activeContentRootOwnersRef.current
        .get(presentation)
        ?.get(root);

      if (
        activeOwner &&
        contentRootOwnerViewEditorsRef.current
          .get(presentation)
          ?.has(getContentRootOwnerKey(activeOwner))
      ) {
        return activeOwner;
      }

      const activeViewEditor = activeViewEditorsRef.current
        .get(presentation)
        ?.get(root);

      return activeViewEditor
        ? (contentRootOwnersRef.current.get(activeViewEditor) ?? null)
        : null;
    },
    []
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
      maybeBatchUpdates(() => {
        handleSelectorChange(
          commit,
          getSchemaInvalidatedNodeKeys(runtime, commit)
        );
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
  }, [commitPublicationQueue, handleSelectorChange, reactEditor, runtime]);

  const provider = useMemo(
    () => ({
      getActiveContentRootOwner,
      getContentRootOwnerViewEditor,
      getMountedViewEditor: findMountedViewEditor,
      getView,
      registerContentRootOwner,
      registerViewEditor,
      runtime,
      selectorContext,
      setActiveViewEditor,
    }),
    [
      findMountedViewEditor,
      getActiveContentRootOwner,
      getContentRootOwnerViewEditor,
      getView,
      registerContentRootOwner,
      registerViewEditor,
      runtime,
      selectorContext,
      setActiveViewEditor,
    ]
  );

  return (
    <ProviderContext value={provider}>
      <SurfaceRuntimeScope presentation={null}>
        <EditorAnnouncementLiveRegion editor={runtime} />
        {children}
      </SurfaceRuntimeScope>
    </ProviderContext>
  );
}

type ReactEditorState = EditorStateView<
  ValueOf<ReactEditorType>,
  PluginsOf<ReactEditorType>
>;

/**
 * Subscribe to a selected value from the root runtime editor state.
 *
 * Use this for toolbar, sidebar, and shell UI that reads the whole editor
 * runtime. Use `useRootState` for root-scoped UI in multi-root editors.
 * Inline selectors observe current render values. Use `shouldUpdate` when a
 * commit can be skipped before the selector runs. The selector state holds the
 * core editor groups; read a plugin's state through `editor.plugin(Plugin)`.
 */
export function useRuntimeState<T>(
  selector: (state: ReactEditorState) => T,
  {
    deferred,
    equalityFn = refEquality,
    shouldUpdate,
  }: RuntimeStateSelectorOptions<T> = {}
): T {
  const { runtime, selectorContext } = useRequiredPliteRuntimeContext();
  const stateSelector = useCallback(
    () => runtime.read(selector),
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
 * genuinely spans roots. The selector state holds the core editor groups; read
 * a plugin's state through `editor.plugin(Plugin)`.
 */
export function useRootState<T, const TRoot extends RootKey = RootKey>(
  root: NamedRootKey<TRoot> | undefined,
  selector: (state: ReactEditorState) => T,
  {
    deferred,
    equalityFn = refEquality,
    shouldUpdate,
  }: RuntimeStateSelectorOptions<T> = {}
): T {
  if (root === MAIN_ROOT_KEY) {
    throw new Error('Omit root to read the primary document root state.');
  }

  const { getView, presentation, selectorContext } =
    useRequiredPliteRuntimeContext();
  const internalRoot = root ?? MAIN_ROOT_KEY;
  const stateSelector = useCallback(
    () => getView({ root }, presentation ?? undefined).read(selector),
    [getView, presentation, root, selector]
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

/** Options for creating a root-specific command editor. */
export type UseRootEditorOptions = {
  readOnly?: boolean;
};

export function createPliteRootEditor(
  {
    getView,
    presentation,
  }: Pick<PliteRuntimeContextValue, 'getView' | 'presentation'>,
  root?: NamedRootKey,
  readOnly?: boolean
): ReactEditorType {
  return createReactRuntimeViewEditor(
    getView({ readOnly, root }, presentation ?? undefined)
  );
}

/**
 * Create a command-capable editor for one root.
 *
 * The returned object is stable for the requested root and read-only option.
 * Use it for root-specific toolbar/sidebar commands. Pass `readOnly: true`
 * when UI only needs read APIs. Exact plugin capability comes from
 * `editor.plugin(Plugin)`.
 */
export function useRootEditor<const TRoot extends RootKey = RootKey>(
  root?: NamedRootKey<TRoot>,
  options: UseRootEditorOptions = {}
): ReactEditorType {
  if (root === MAIN_ROOT_KEY) {
    throw new Error('Omit root to create an editor for the primary document.');
  }

  const { getView, presentation } = useRequiredPliteRuntimeContext();

  return useMemo(
    () =>
      createPliteRootEditor({ getView, presentation }, root, options.readOnly),
    [getView, options.readOnly, presentation, root]
  );
}

/** Focus behavior before or after root command callbacks. */
export type CommandFocusPolicy = 'none' | 'preserve' | 'restore-root';

/** Options for `useCommand`. */
export type UseCommandOptions<TRoot extends RootKey = RootKey> = {
  focus?: CommandFocusPolicy;
  root?: NamedRootKey<TRoot>;
};

const usePliteResolvedRoot = (root: NamedRootKey | undefined): RootKey => {
  if (root === MAIN_ROOT_KEY) {
    throw new Error('Omit root to target the primary document.');
  }

  const editableRoot = useContext(PliteEditableRootContext);
  const activeRoot = useRuntimeState(selectActiveRoot, {
    equalityFn: rootKeyEquality,
    shouldUpdate: selectionChanged,
  });

  return root ?? editableRoot ?? activeRoot;
};

type CommandArgs<TCommand extends EditorCommandDescriptor> = [
  EditorCommandInput<TCommand>,
] extends [void]
  ? [] | [input: EditorCommandInput<TCommand>]
  : [input: EditorCommandInput<TCommand>];

/** Typed dispatcher returned for one semantic command descriptor. */
export type CommandDispatcher<TCommand extends EditorCommandDescriptor> = (
  ...input: CommandArgs<TCommand>
) => boolean | undefined;

/**
 * Bind one semantic command to the mounted editor for a root.
 *
 * Command input belongs to the returned dispatcher, so event-time data never
 * becomes hook configuration. Pass `root` for a known root and use
 * `focus: 'restore-root'` when the command should first restore editor focus.
 */
export function useCommand<
  TCommand extends EditorCommandDescriptor,
  const TRoot extends RootKey = RootKey,
>(
  command: TCommand & CompatibleEditorCommand<ReactEditorType, TCommand>,
  options: UseCommandOptions<TRoot> = {}
): CommandDispatcher<TCommand> {
  const { focus = 'preserve', root } = options;
  const resolvedRoot = usePliteResolvedRoot(root);
  const publicRoot = toPublicRootOption(resolvedRoot);
  const context = useRequiredPliteRuntimeContext();
  const fallbackEditor = useRootEditor(publicRoot);

  return useCallback(
    (...input: CommandArgs<TCommand>) => {
      const commandEditor =
        context.getMountedViewEditor(resolvedRoot) ?? fallbackEditor;

      if (focus === 'restore-root') {
        focusPliteEditable(commandEditor);
      }

      return dispatchCommand(commandEditor, command, ...input);
    },
    [command, context, fallbackEditor, focus, resolvedRoot]
  );
}
