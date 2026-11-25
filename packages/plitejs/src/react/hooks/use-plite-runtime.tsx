import React, {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useInsertionEffect,
  useRef,
  useState,
  useSyncExternalStore,
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
import { assertEditorNotDestroyed } from '../../core/editor-lifetime';
import type { ViewPolicyTarget } from '../../core/editor-runtime';
import { releaseEditorViewLifetime } from '../../core/editor-view-lifetime';
import { createEditorViewPluginApis } from '../../core/plugin';
import { toPublicRoot } from '../../core/public-root';
import {
  getBaseCallRoot,
  getEditorReadDepth,
  getEditorRuntimeRootKeys,
  hasEditorSurface,
  isInTransaction,
  subscribeCaretTarget,
} from '../../core/public-state';
import {
  continueRootViewUse,
  mountRootView,
  readNestedRootView,
  readRootTarget,
  readRootViewUse,
  subscribeRootTarget,
  subscribeRootViewPresentation,
} from '../../core/root-target';
import type { ViewPresentation } from '../../core/view-presentation';
import type { DOMApi } from '../../dom';
import {
  createDOMEditorCapability,
  EDITOR_TO_ROOT_VIEW_EDITORS,
} from '../../dom/internal';
import {
  carryRootEditors,
  createEditorViewRuntime,
  getOwnViewReadOnly,
  getViewPresentation,
} from '../../editor-runtime-view';
import type { Editor } from '../../interfaces/editor';
import { EditorAnnouncementLiveRegion } from '../components/editor-announcement-live-region';
import { PliteEditableRootContext } from '../context';
import {
  getMountedEditableDOMRuntime,
  getMountedEditableDOMRuntimes,
} from '../editable/editable-dom-runtime';
import type { HistoryGateScope } from '../editable/mutation-history';
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
  createHistoryStepViews,
  type HistoryStepSlot,
} from '../history-step-views';
import {
  type ReactRuntimeEditor,
  toReactRuntimeEditor,
} from '../plugin/react-editor';
import type { Editor as ReactEditorType, ReactApi } from '../plugin/with-react';
import { MAIN_ROOT_KEY, toPublicRootOption } from '../root-key';
import { REACT_MAJOR_VERSION } from '../utils/environment';
import { focusPliteEditable } from './focus-plite-editable';
import {
  callShouldUpdate,
  type EditorSelectorContextValue,
  useEditorSelectorContext,
} from './use-editor-selector';
import { useGenericSelector } from './use-generic-selector';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

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

const findPaneOfView = (runtime: ReactEditorType, view: Editor) => {
  const key = getEditorRuntime(view);
  const panes = getMountedEditableDOMRuntimes(runtime).filter(
    (pane) => getEditorRuntime(pane.editor) === key
  );

  if (panes.length < 2) return panes[0] ?? null;

  return (
    panes.find((pane) =>
      pane.rootRef.current?.contains(
        pane.rootRef.current.ownerDocument.activeElement
      )
    ) ?? null
  );
};

const getContentRootOwnerKey = (owner: PliteContentRootOwner) =>
  `${owner.ownerRoot}\u0000${owner.ownerPath.join('.')}\u0000${
    owner.childRoot
  }`;

const getSlotRootKey = (slot: HistoryStepSlot, owner: PliteContentRootOwner) =>
  `${slot.owner}\u0000${slot.slot}\u0000${owner.childRoot}`;

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
    isReadOnly: () => editor.read.view.isReadOnly() || domApi.isReadOnly(),
    settleInput: () =>
      getMountedEditableDOMRuntime(editor)?.settleInput() ??
      !domApi.isComposing(),
    subscribeTypedText: (listener) => subscribeTypedText(editor, listener),
  });

type MountedViewEditor = ReactRuntimeEditor<Value, PluginsOf<ReactEditorType>>;

type MountedRootTarget = Readonly<{ shown: boolean; view: MountedViewEditor }>;

type PliteRuntimeContextValue = {
  getActiveContentRootOwner: (root: RootKey) => PliteContentRootOwner | null;
  getContentRootOwnerViewEditor: (
    owner: PliteContentRootOwner
  ) => MountedViewEditor | null;
  getMountedViewEditor: (root: RootKey) => MountedViewEditor | null;
  getRootTarget: (root: RootKey) => MountedRootTarget | null;
  historyScope: HistoryGateScope | null;
  getView: (
    options?: EditorViewOptions,
    presentation?: ViewPresentation,
    policyTarget?: ViewPolicyTarget,
    mountedIn?: Editor
  ) => EditorView<Value, PluginsOf<ReactEditorType>>;
  mountedEditor: MountedViewEditor | null;
  presentation: ViewPresentation | null;
  registerContentRootOwner: (
    editor: MountedViewEditor,
    owner: PliteContentRootOwner,
    slot: HistoryStepSlot
  ) => () => void;
  registerHistoryStepView: (editor: MountedViewEditor, root: RootKey) => void;
  registerViewEditor: (editor: MountedViewEditor, root: RootKey) => () => void;
  rootEditor: (root?: NamedRootKey, readOnly?: boolean) => ReactEditorType;
  runtime: ReactEditorType;
  selectorContext: EditorSelectorContextValue;
  subscribeRootTarget: (root: RootKey, listener: () => void) => () => void;
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
  getRootTarget: (
    root: RootKey,
    presentation: ViewPresentation | null
  ) => MountedRootTarget | null;
  subscribeRootTarget: (
    root: RootKey,
    presentation: ViewPresentation | null,
    listener: () => void
  ) => () => void;
};

type RuntimeScopeLookups = Omit<PliteRuntimeContextValue, 'rootEditor'>;

type PliteRuntimeProviderValue = Omit<
  RuntimeScopeLookups,
  keyof PresentationLookups | 'historyScope' | 'mountedEditor' | 'presentation'
> &
  PresentationLookups;

const scopeRuntimeContext = (
  provider: PliteRuntimeProviderValue,
  presentation: ViewPresentation | null,
  mountedEditor: MountedViewEditor | null
): RuntimeScopeLookups => ({
  ...provider,
  getActiveContentRootOwner: (root) =>
    provider.getActiveContentRootOwner(root, presentation),
  getContentRootOwnerViewEditor: (owner) =>
    provider.getContentRootOwnerViewEditor(owner, presentation),
  getMountedViewEditor: (root) =>
    provider.getMountedViewEditor(root, presentation),
  getRootTarget: (root) => provider.getRootTarget(root, presentation),
  historyScope: presentation
    ? Object.freeze({ owner: provider.runtime, presentation })
    : null,
  mountedEditor,
  presentation,
  subscribeRootTarget: (root, listener) =>
    provider.subscribeRootTarget(root, presentation, listener),
});

const withRootEditors = (
  lookups: RuntimeScopeLookups
): PliteRuntimeContextValue => {
  const rootEditors = new Map<
    string,
    Readonly<{ editor: ReactEditorType; readOnly: boolean; root: RootKey }>
  >();
  const departed = new Map<string, WeakRef<ReactEditorType>>();
  const releaseDeparted = () => {
    const inDocument = new Set(getEditorRuntimeRootKeys(lookups.runtime));

    for (const [key, held] of departed) {
      if (!held.deref()) departed.delete(key);
    }
    for (const [key, { editor, readOnly, root }] of rootEditors) {
      const lockChanged = getOwnViewReadOnly(editor) !== readOnly;

      if (inDocument.has(root) || lockChanged) continue;

      rootEditors.delete(key);
      departed.set(key, new WeakRef(editor));
    }
  };
  const context: PliteRuntimeContextValue = {
    ...lookups,
    rootEditor: (root, readOnly = false) => {
      const internalRoot = root ?? MAIN_ROOT_KEY;
      const key = `${readOnly}\u0000${internalRoot}`;
      const cached = rootEditors.get(key);

      if (cached) return cached.editor;

      let editor = departed.get(key)?.deref();

      if (editor) {
        departed.delete(key);
      } else {
        releaseDeparted();
        editor = createPliteRootEditor(lookups, root, readOnly);
      }
      rootEditors.set(key, { editor, readOnly, root: internalRoot });

      return editor;
    },
  };

  return context;
};

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

// In StrictMode, React calls a memo's function a second time and keeps the
// first result. Without this cache, that second call would carry a context
// that React dropped.
const VIEW_SCOPES = new WeakMap<
  MountedViewEditor,
  Readonly<{
    context: PliteRuntimeContextValue;
    presentation: ViewPresentation | null;
    provider: PliteRuntimeProviderValue;
  }>
>();

const scopeOfView = (
  provider: PliteRuntimeProviderValue,
  presentation: ViewPresentation | null,
  mountedEditor: MountedViewEditor
) => {
  const kept = VIEW_SCOPES.get(mountedEditor);

  if (kept?.presentation === presentation && kept.provider === provider) {
    return kept.context;
  }

  const context = withRootEditors(
    scopeRuntimeContext(provider, presentation, mountedEditor)
  );

  VIEW_SCOPES.set(mountedEditor, { context, presentation, provider });
  carryRootEditors(mountedEditor, context.rootEditor);

  return context;
};

export const SurfaceRuntimeScope = ({
  children,
  mountedEditor,
  presentation,
}: {
  children: ReactNode;
  mountedEditor: MountedViewEditor | null;
  presentation: ViewPresentation | null;
}) => {
  const provider =
    useContext(ProviderContext) ??
    failInvariant('A mounted surface requires an editor runtime provider.');
  const value = useMemo(
    () =>
      mountedEditor
        ? scopeOfView(provider, presentation, mountedEditor)
        : withRootEditors(scopeRuntimeContext(provider, presentation, null)),
    [mountedEditor, presentation, provider]
  );

  return <PliteRuntimeContext value={value}>{children}</PliteRuntimeContext>;
};

export const EditingAreaRootEditors = ({
  children,
}: {
  children: ReactNode;
}) => {
  const around = useRequiredPliteRuntimeContext();
  const value = useMemo(() => withRootEditors(around), [around]);

  return <PliteRuntimeContext value={value}>{children}</PliteRuntimeContext>;
};

/** Selector options for `useRuntimeState` and `useRootState`. */
export type RuntimeStateSelectorOptions<T> = {
  deferred?: boolean;
  equalityFn?: (a: T, b: T) => boolean;
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

  const portals = new WeakMap<object, object>();
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
    const known = portals.get(portal);

    if (known) return known;

    const viewPortal = new Proxy(portal, {
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

    portals.set(portal, viewPortal);

    return viewPortal;
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
  const [historyStepViews] = useState(() =>
    createHistoryStepViews(runtime, (view) => findPaneOfView(runtime, view))
  );
  const contentRootOwnersRef = useRef(
    new Map<typeof reactEditor, PliteContentRootOwner>()
  );
  const contentRootOwnerViewEditorsRef = useRef(
    new Map<ViewPresentation, Map<string, typeof reactEditor>>()
  );
  const lastRootUseBySlotRef = useRef(
    new WeakMap<Editor, Map<string, number>>()
  );
  const subscribeProviderRootTarget = useCallback(
    (
      root: RootKey,
      presentation: ViewPresentation | null,
      listener: () => void
    ) =>
      presentation
        ? subscribeRootTarget(runtime, presentation, root, listener)
        : () => {},
    [runtime]
  );
  const getView = useCallback(
    (
      options: EditorViewOptions = {},
      presentation?: ViewPresentation,
      policyTarget?: ViewPolicyTarget,
      mountedIn?: Editor
    ) =>
      createEditorViewRuntime(
        runtime,
        options,
        presentation,
        policyTarget,
        mountedIn
      ),
    [runtime]
  );
  // The store types a view as a core editor. `registerViewEditor` is the one
  // caller that mounts a view of this runtime there.
  const readProviderRootTarget = useCallback(
    (root: RootKey, presentation: ViewPresentation | null) =>
      (presentation
        ? readRootTarget(runtime, presentation, root)
        : null) as MountedRootTarget | null,
    [runtime]
  );
  const findMountedViewEditor = useCallback(
    (root: RootKey, presentation: ViewPresentation | null) =>
      readProviderRootTarget(root, presentation)?.view ?? null,
    [readProviderRootTarget]
  );
  const registerViewEditor = useCallback(
    (editor: typeof reactEditor, root: RootKey) => {
      const presentation = getViewPresentation(editor);
      const rootViewEditors =
        EDITOR_TO_ROOT_VIEW_EDITORS.get(runtime) ?? new Set();

      rootViewEditors.add(editor);
      EDITOR_TO_ROOT_VIEW_EDITORS.set(runtime, rootViewEditors);
      const unmountRootView = mountRootView(
        runtime,
        presentation,
        root,
        editor
      );

      return () => {
        unmountRootView();
        releaseEditorViewLifetime(editor);
        rootViewEditors.delete(editor);
        const owner = contentRootOwnersRef.current.get(editor);
        const ownerViewEditors =
          contentRootOwnerViewEditorsRef.current.get(presentation);

        contentRootOwnersRef.current.delete(editor);
        if (owner && ownerViewEditors) {
          unregisterContentRootOwnerViewEditor(ownerViewEditors, owner, editor);
        }

        if (rootViewEditors.size === 0) {
          EDITOR_TO_ROOT_VIEW_EDITORS.delete(runtime);
        }
        const presentationStillMounted = [...rootViewEditors].some(
          (viewEditor) => getViewPresentation(viewEditor) === presentation
        );

        if (!presentationStillMounted) {
          contentRootOwnerViewEditorsRef.current.delete(presentation);
        }
      };
    },
    [runtime]
  );
  const registerContentRootOwner = useCallback(
    (
      editor: typeof reactEditor,
      owner: PliteContentRootOwner,
      slot: HistoryStepSlot
    ) => {
      const ownerViewEditors = presentationMap(
        contentRootOwnerViewEditorsRef.current,
        getViewPresentation(editor)
      );
      const lastRootUses =
        lastRootUseBySlotRef.current.get(slot.parent) ??
        new Map<string, number>();
      const place = getSlotRootKey(slot, owner);

      lastRootUseBySlotRef.current.set(slot.parent, lastRootUses);
      continueRootViewUse(editor, lastRootUses.get(place) ?? 0);
      historyStepViews.registerSlot(editor, slot);
      contentRootOwnersRef.current.set(editor, owner);
      ownerViewEditors.set(getContentRootOwnerKey(owner), editor);

      return () => {
        lastRootUses.set(place, readRootViewUse(editor));
        if (contentRootOwnersRef.current.get(editor) === owner) {
          contentRootOwnersRef.current.delete(editor);
          unregisterContentRootOwnerViewEditor(ownerViewEditors, owner, editor);
        }
      };
    },
    [historyStepViews]
  );
  // Insertion effects survive StrictMode replays and Activity hides, so the
  // recorder stays subscribed until the provider unmounts.
  useInsertionEffect(() => historyStepViews.subscribe(), [historyStepViews]);
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
      const activeViewEditor = findMountedViewEditor(root, presentation);

      return activeViewEditor
        ? (contentRootOwnersRef.current.get(activeViewEditor) ?? null)
        : null;
    },
    [findMountedViewEditor]
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
      getRootTarget: readProviderRootTarget,
      getView,
      registerContentRootOwner,
      registerHistoryStepView: historyStepViews.registerView,
      registerViewEditor,
      runtime,
      selectorContext,
      subscribeRootTarget: subscribeProviderRootTarget,
    }),
    [
      findMountedViewEditor,
      getActiveContentRootOwner,
      getContentRootOwnerViewEditor,
      getView,
      historyStepViews,
      readProviderRootTarget,
      registerContentRootOwner,
      registerViewEditor,
      runtime,
      selectorContext,
      subscribeProviderRootTarget,
    ]
  );

  return (
    <ProviderContext value={provider}>
      <SurfaceRuntimeScope mountedEditor={null} presentation={null}>
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
  { deferred, equalityFn, shouldUpdate }: RuntimeStateSelectorOptions<T> = {}
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
    (change?: EditorCommit) =>
      callShouldUpdate(runtime, shouldUpdateRef.current, change),
    [runtime]
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
  { deferred, equalityFn, shouldUpdate }: RuntimeStateSelectorOptions<T> = {}
): T {
  if (root === MAIN_ROOT_KEY) {
    throw new Error('Omit root to read the primary document root state.');
  }

  const { getView, presentation, runtime, selectorContext } =
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

      return callShouldUpdate(runtime, shouldUpdateRef.current, change);
    },
    [internalRoot, runtime]
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

// The store types a view as a core editor, as `readProviderRootTarget` says.
const findRootViewEditor = (
  {
    getMountedViewEditor,
    mountedEditor,
    presentation,
    runtime,
  }: RuntimeScopeLookups,
  root: RootKey
) =>
  ((mountedEditor && presentation
    ? readNestedRootView(runtime, presentation, root, mountedEditor)
    : null) as MountedViewEditor | null) ?? getMountedViewEditor(root);

function createPliteRootEditor(
  lookups: RuntimeScopeLookups,
  root?: NamedRootKey,
  readOnly?: boolean
): ReactEditorType {
  const { getView, mountedEditor, presentation } = lookups;
  const shownRoot = root ?? MAIN_ROOT_KEY;

  return createReactRuntimeViewEditor(
    getView({ readOnly, root }, presentation ?? undefined, {
      current: () =>
        findRootViewEditor(lookups, shownRoot) ?? mountedEditor ?? undefined,
      subscribe: (listener) => {
        const stopTarget = lookups.subscribeRootTarget(shownRoot, listener);

        if (!mountedEditor || !presentation) return stopTarget;

        const stopOwn = subscribeRootViewPresentation(presentation, listener);

        return () => {
          stopTarget();
          stopOwn();
        };
      },
    })
  );
}

/**
 * Create a command-capable editor for one root.
 *
 * The returned object is stable for the requested root and read-only option.
 * A renderer inside an `Editable` gets another object than UI outside it, so
 * a lock set through one does not reach the other.
 * It obeys the read-only state and the authored view of the mounted view that
 * shows its root, and of the view around the hook while none shows it. Inside
 * a view, that mounted view is the one this view mounts for the root, such as
 * its own board when two editing areas show the same board. It acts only
 * under its own `EditorRoot`, so while that `EditorRoot` shows no editing
 * area for its root, `api.dom.editable()` returns `null`, even when an
 * editing area in another `EditorRoot` holds the caret. Use it for
 * root-specific toolbar/sidebar commands. Pass `readOnly: true` when UI only
 * needs read APIs. Exact plugin capability comes from `editor.plugin(Plugin)`.
 */
export function useRootEditor<const TRoot extends RootKey = RootKey>(
  root?: NamedRootKey<TRoot>,
  options: UseRootEditorOptions = {}
): ReactEditorType {
  if (root === MAIN_ROOT_KEY) {
    throw new Error('Omit root to create an editor for the primary document.');
  }

  return useRequiredPliteRuntimeContext().rootEditor(root, options.readOnly);
}

/**
 * Return a command-capable editor for the root that holds the caret, such as
 * a board note, or for the primary root while nothing is selected.
 *
 * Use it for UI outside every `Editable`, such as a toolbar, that acts where
 * the caret is. The editor works as the one `useRootEditor` returns for that
 * root, and the hook renders again only when the caret moves to another root.
 */
export function useCaretEditor(): ReactEditorType {
  const context = useRequiredPliteRuntimeContext();
  const owner = getEditorRuntimeOwner(context.runtime);
  const readRoot = () => toPublicRoot(getBaseCallRoot(owner));
  const root = useSyncExternalStore(
    useCallback((listener) => subscribeCaretTarget(owner, listener), [owner]),
    readRoot,
    readRoot
  );

  return context.rootEditor(root);
}

/** Focus behavior before or after root command callbacks. */
export type CommandFocusPolicy = 'none' | 'preserve' | 'restore-root';

/** Options for `useCommand`. */
export type UseCommandOptions<TRoot extends RootKey = RootKey> = {
  focus?: CommandFocusPolicy;
  root?: NamedRootKey<TRoot>;
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
 * Without `root`, the command runs in the root of the `Editable` around the
 * hook, or else in the caret's root when the dispatcher runs.
 * The command runs on the mounted view that shows the root, and on the editor
 * `useRootEditor` gives for the root while none shows it, so a lock on either
 * refuses its writes. The dispatcher throws inside `editor.read` and
 * `editor.update`, before it moves focus. Inside an update, run the command
 * with `tx.command` in an update of the root's `useRootEditor` editor, so it
 * keeps that view's suggesting mode.
 */
export function useCommand<
  TCommand extends EditorCommandDescriptor,
  const TRoot extends RootKey = RootKey,
>(
  command: TCommand & CompatibleEditorCommand<ReactEditorType, TCommand>,
  options: UseCommandOptions<TRoot> = {}
): CommandDispatcher<TCommand> {
  const { focus = 'preserve', root } = options;

  if (root === MAIN_ROOT_KEY) {
    throw new Error('Omit root to target the primary document.');
  }

  const editableRoot = useContext(PliteEditableRootContext);
  const fixedRoot = root ?? editableRoot;
  const context = useRequiredPliteRuntimeContext();

  return useCallback(
    (...input: CommandArgs<TCommand>) => {
      assertEditorNotDestroyed(context.runtime);

      if (
        isInTransaction(context.runtime) ||
        getEditorReadDepth(context.runtime) > 0
      ) {
        throw new Error(
          "A useCommand dispatcher cannot run inside editor.read or editor.update. Call it after the read returns; inside an update, call tx.command in an update of the root's useRootEditor editor."
        );
      }

      // A focus moves the caret's root before this hook renders again, so a
      // command called from it reads the root when it runs.
      const commandRoot = fixedRoot ?? context.runtime.read(selectActiveRoot);
      const view = findRootViewEditor(context, commandRoot);
      const commandEditor =
        view && hasEditorSurface(view)
          ? view
          : context.rootEditor(toPublicRootOption(commandRoot));

      if (focus === 'restore-root' && !commandEditor.read.view.isReadOnly()) {
        focusPliteEditable(commandEditor);
      }

      return dispatchCommand(commandEditor, command, ...input);
    },
    [command, context, fixedRoot, focus]
  );
}
