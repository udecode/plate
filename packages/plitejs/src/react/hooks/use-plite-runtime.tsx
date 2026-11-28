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
  type EditorStateView,
  type EditorView,
  type EditorViewOptions,
  type PluginsOf,
  type NamedRootKey,
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
  getActiveCaretRoot,
  getEditorReadDepth,
  hasEditorRuntimeRoot,
  hasEditorSurface,
  isInTransaction,
  onOwnViewReadOnlyChange,
  subscribeActiveCaretRoot,
} from '../../core/public-state';
import {
  continueRootViewUse,
  mountRootView,
  readNestedRootView,
  readRootContentTarget,
  readRootTarget,
  readRootViewContentUse,
  readRootViewUse,
  registerSlotCarryHost,
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
import {
  PliteContentRootInstanceContext,
  PliteEditableRootContext,
  PliteEditingAreaContext,
} from '../context';
import {
  deleteViewEditorContentRootOwner,
  setViewEditorContentRootOwner,
} from '../editable/content-root-owners';
import {
  type EditableDOMRuntime,
  type EditableHistoryReplay,
  getMountedEditableDOMRuntime,
} from '../editable/editable-dom-runtime';
import { completeHistoryFocus } from '../editable/history-focus';
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
import type {
  Editor as ReactEditorType,
  EditorContextValue,
  ReactApi,
} from '../plugin/with-react';
import { MAIN_ROOT_KEY, toPublicRootOption } from '../root-key';
import { createSlotArrivalHost, type ViewInstanceInfo } from '../slot-arrival';
import { REACT_MAJOR_VERSION } from '../utils/environment';
import {
  getPliteViewBoundaryOwnerKey,
  type PliteViewBoundaryOwner,
} from '../view-boundary-graph-core';
import { focusPliteEditable } from './focus-plite-editable';
import { useOptionalEditorContext } from './use-editor-context';
import {
  type EditorSelectorContextValue,
  useEditorSelectorContext,
} from './use-editor-selector';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';

const selectActiveRoot = (state: ReactEditorState): RootKey => {
  const selection = state.selection();

  return SelectionApi.root(selection) ?? MAIN_ROOT_KEY;
};

type PluginLike = {
  name: string;
};

const getSlotRootKey = (slot: HistoryStepSlot, owner: PliteViewBoundaryOwner) =>
  `${slot.owner}\u0000${slot.slot}\u0000${owner.childRoot}`;

export const unregisterContentRootOwnerViewEditor = <TEditor,>(
  ownerViewEditors: Map<string, TEditor>,
  owner: PliteViewBoundaryOwner,
  editor: TEditor
) => {
  const ownerKey = getPliteViewBoundaryOwnerKey(owner);

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
  completeHistoryReplay: (replay: EditableHistoryReplay) => void;
  getActiveContentRootOwner: (root: RootKey) => PliteViewBoundaryOwner | null;
  getContentRootOwnerViewEditor: (
    owner: PliteViewBoundaryOwner
  ) => MountedViewEditor | null;
  getMountedContentViewEditor: (root: RootKey) => MountedViewEditor | null;
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
    owner: PliteViewBoundaryOwner,
    slot: HistoryStepSlot
  ) => () => void;
  registerHistoryStepPane: (pane: EditableDOMRuntime) => () => void;
  registerHistoryStepSlot: (
    editor: MountedViewEditor,
    slot: HistoryStepSlot
  ) => void;
  registerHistoryStepView: (editor: MountedViewEditor, root: RootKey) => void;
  registerViewEditor: (
    editor: MountedViewEditor,
    root: RootKey,
    instance: ViewInstanceInfo | null
  ) => () => void;
  rootEditor: (root?: NamedRootKey, readOnly?: boolean) => ReactEditorType;
  runtime: ReactEditorType;
  selectorContext: EditorSelectorContextValue;
  subscribeRootTarget: (root: RootKey, listener: () => void) => () => void;
  updateViewInstance: (
    editor: MountedViewEditor,
    instance: ViewInstanceInfo | null
  ) => void;
};

type PresentationLookups = {
  getActiveContentRootOwner: (
    root: RootKey,
    presentation: ViewPresentation | null
  ) => PliteViewBoundaryOwner | null;
  getContentRootOwnerViewEditor: (
    owner: PliteViewBoundaryOwner,
    presentation: ViewPresentation | null
  ) => MountedViewEditor | null;
  getMountedContentViewEditor: (
    root: RootKey,
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
  getMountedContentViewEditor: (root) =>
    provider.getMountedContentViewEditor(root, presentation),
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
    Readonly<{
      editor: ReactEditorType;
      readOnly: boolean;
      root: RootKey;
    }>
  >();
  const lockedAbsent = new Map<
    string,
    Readonly<{
      editor: ReactEditorType;
      readOnly: boolean;
      root: RootKey;
    }>
  >();
  const departed = new Map<string, WeakRef<ReactEditorType>>();
  let nextDepartedPruneSize = 64;
  let lastSweepVersion = lookups.runtime.read.lastCommit()?.version;
  let sweptOnce = false;

  const pruneDeparted = () => {
    for (const [key, held] of departed) {
      if (!held.deref()) departed.delete(key);
    }
    nextDepartedPruneSize = Math.max(64, departed.size * 2);
  };

  const releaseLockedAbsent = () => {
    if (lockedAbsent.size === 0) return;
    for (const [key, entry] of lockedAbsent) {
      if (hasEditorRuntimeRoot(lookups.runtime, entry.root)) {
        lockedAbsent.delete(key);
        rootEditors.set(key, entry);
      }
    }
  };

  const releaseDeparted = () => {
    const version = lookups.runtime.read.lastCommit()?.version;

    if (departed.size > nextDepartedPruneSize) pruneDeparted();

    if (sweptOnce && version === lastSweepVersion) {
      return;
    }

    sweptOnce = true;
    lastSweepVersion = version;
    releaseLockedAbsent();

    for (const [key, entry] of rootEditors) {
      if (hasEditorRuntimeRoot(lookups.runtime, entry.root)) continue;
      rootEditors.delete(key);
      if (getOwnViewReadOnly(entry.editor) !== entry.readOnly) {
        lockedAbsent.set(key, entry);
      } else {
        departed.set(key, new WeakRef(entry.editor));
      }
    }
  };
  const context: PliteRuntimeContextValue = {
    ...lookups,
    rootEditor: (root, readOnly = false) => {
      releaseDeparted();

      const internalRoot = root ?? MAIN_ROOT_KEY;
      const key = `${readOnly}\u0000${internalRoot}`;
      const cached = rootEditors.get(key) ?? lockedAbsent.get(key);

      if (cached) return cached.editor;

      let editor = departed.get(key)?.deref();

      if (editor) {
        departed.delete(key);
      } else {
        editor = createPliteRootEditor(lookups, root, readOnly);
        const weakEditor = new WeakRef(editor);

        onOwnViewReadOnlyChange(editor, (nextReadOnly) => {
          const live = weakEditor.deref();

          if (!live || rootEditors.has(key)) return;
          if (nextReadOnly !== readOnly) {
            departed.delete(key);
            lockedAbsent.set(key, {
              editor: live,
              readOnly,
              root: internalRoot,
            });
          } else if (lockedAbsent.get(key)?.editor === live) {
            lockedAbsent.delete(key);
            departed.set(key, weakEditor);
          }
        });
      }

      const entry = { editor, readOnly, root: internalRoot };

      if (hasEditorRuntimeRoot(lookups.runtime, internalRoot)) {
        rootEditors.set(key, entry);
      } else if (getOwnViewReadOnly(editor) !== readOnly) {
        lockedAbsent.set(key, entry);
      } else {
        departed.set(key, new WeakRef(editor));
      }

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
  const [historyStepViews] = useState(() => createHistoryStepViews(runtime));
  const [slotArrivalHost] = useState(() => createSlotArrivalHost(runtime));
  const completeHistoryReplay = useCallback(
    (replay: EditableHistoryReplay) =>
      completeHistoryFocus(replay, historyStepViews),
    [historyStepViews]
  );
  const contentRootOwnersRef = useRef(
    new Map<typeof reactEditor, PliteViewBoundaryOwner>()
  );
  const contentRootOwnerViewEditorsRef = useRef(
    new Map<ViewPresentation, Map<string, typeof reactEditor>>()
  );
  const lastRootUseBySlotRef = useRef(
    new WeakMap<
      Editor,
      Map<string, Readonly<{ content: number; interaction: number }>>
    >()
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
  const findMountedContentViewEditor = useCallback(
    (root: RootKey, presentation: ViewPresentation | null) =>
      ((presentation
        ? readRootContentTarget(runtime, presentation, root)?.view
        : null) ?? null) as MountedViewEditor | null,
    [runtime]
  );
  const registerViewEditor = useCallback(
    (
      editor: typeof reactEditor,
      root: RootKey,
      instance: ViewInstanceInfo | null
    ) => {
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
      const unmountArrivalView = slotArrivalHost.onViewMounted(
        editor,
        root,
        instance
      );

      return () => {
        unmountArrivalView();
        unmountRootView();
        releaseEditorViewLifetime(editor);
        rootViewEditors.delete(editor);
        const owner = contentRootOwnersRef.current.get(editor);
        const ownerViewEditors =
          contentRootOwnerViewEditorsRef.current.get(presentation);

        contentRootOwnersRef.current.delete(editor);
        deleteViewEditorContentRootOwner(editor);
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
    [runtime, slotArrivalHost]
  );
  const registerContentRootOwner = useCallback(
    (
      editor: typeof reactEditor,
      owner: PliteViewBoundaryOwner,
      slot: HistoryStepSlot
    ) => {
      const ownerViewEditors = presentationMap(
        contentRootOwnerViewEditorsRef.current,
        getViewPresentation(editor)
      );
      const lastRootUses =
        lastRootUseBySlotRef.current.get(slot.parent) ??
        new Map<string, Readonly<{ content: number; interaction: number }>>();
      const place = getSlotRootKey(slot, owner);
      const lastUse = lastRootUses.get(place);

      lastRootUseBySlotRef.current.set(slot.parent, lastRootUses);
      if (lastUse) {
        continueRootViewUse(editor, lastUse.content, lastUse.interaction);
      }
      contentRootOwnersRef.current.set(editor, owner);
      setViewEditorContentRootOwner(editor, owner);
      ownerViewEditors.set(getPliteViewBoundaryOwnerKey(owner), editor);

      return () => {
        lastRootUses.set(place, {
          content: readRootViewContentUse(editor),
          interaction: readRootViewUse(editor),
        });
        if (contentRootOwnersRef.current.get(editor) === owner) {
          contentRootOwnersRef.current.delete(editor);
          deleteViewEditorContentRootOwner(editor, owner);
          unregisterContentRootOwnerViewEditor(ownerViewEditors, owner, editor);
        }
      };
    },
    []
  );
  // Insertion effects survive StrictMode replays and Activity hides, so the
  // recorder and slot arrival host stay subscribed until the provider unmounts.
  useInsertionEffect(() => {
    const stopHistory = historyStepViews.subscribe();
    const stopCarryHost = registerSlotCarryHost(runtime, slotArrivalHost);
    const stopCommit = runtime.subscribeCommit(slotArrivalHost.onCommit);

    return () => {
      stopCommit();
      stopCarryHost();
      slotArrivalHost.clear();
      stopHistory();
    };
  }, [historyStepViews, runtime, slotArrivalHost]);
  const getContentRootOwnerViewEditor = useCallback(
    (owner: PliteViewBoundaryOwner, presentation: ViewPresentation | null) => {
      const key = getPliteViewBoundaryOwnerKey(owner);

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
      const activeViewEditor = findMountedContentViewEditor(root, presentation);

      return activeViewEditor
        ? (contentRootOwnersRef.current.get(activeViewEditor) ?? null)
        : null;
    },
    [findMountedContentViewEditor]
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
      completeHistoryReplay,
      getActiveContentRootOwner,
      getContentRootOwnerViewEditor,
      getMountedContentViewEditor: findMountedContentViewEditor,
      getMountedViewEditor: findMountedViewEditor,
      getRootTarget: readProviderRootTarget,
      getView,
      registerContentRootOwner,
      registerHistoryStepPane: historyStepViews.registerPane,
      registerHistoryStepSlot: historyStepViews.registerSlot,
      registerHistoryStepView: historyStepViews.registerView,
      registerViewEditor,
      runtime,
      selectorContext,
      subscribeRootTarget: subscribeProviderRootTarget,
      updateViewInstance: slotArrivalHost.updateViewInstance,
    }),
    [
      completeHistoryReplay,
      findMountedContentViewEditor,
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
      slotArrivalHost,
      subscribeProviderRootTarget,
    ]
  );

  return (
    <PliteContentRootInstanceContext value={null}>
      <ProviderContext value={provider}>
        <SurfaceRuntimeScope mountedEditor={null} presentation={null}>
          <EditorAnnouncementLiveRegion editor={runtime} />
          {children}
        </SurfaceRuntimeScope>
      </ProviderContext>
    </PliteContentRootInstanceContext>
  );
}

type ReactEditorState = EditorStateView<
  ValueOf<ReactEditorType>,
  PluginsOf<ReactEditorType>
>;

/**
 * Return the owning model editor from the nearest `<EditorRoot>` or
 * `<EditorRuntimeProvider>`.
 */
export function useModelEditor(): ReactEditorType {
  if (arguments.length > 0) {
    throw new Error('useModelEditor() takes no arguments.');
  }

  return useRequiredPliteRuntimeContext().runtime;
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
 * A renderer inside an `EditorContent` gets another object than UI outside it, so
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

const NOOP_SUBSCRIBE = () => () => {};
const RETURN_UNDEFINED = (): NamedRootKey | undefined => undefined;

/**
 * Return the active command editor from the nearest `<EditorRoot>`, or `null`
 * when called outside one.
 *
 * Inside an editing area (`<EditorContent>`), returns that editing area's own
 * editor without subscribing to caret moves. Outside editing areas, such as in
 * a toolbar, returns the root editor for the root holding the caret, or the
 * enclosing `<EditorRoot>`'s root while nothing is selected.
 */
export function useOptionalEditor(): EditorContextValue | null {
  if (arguments.length > 0) {
    throw new Error(
      'useOptionalEditor() takes no arguments. Call useCreateEditor(options, deps) to create an editor.'
    );
  }

  const contextEditor = useOptionalEditorContext();
  const insideEditable = useContext(PliteEditingAreaContext);
  const runtimeContext = useOptionalPliteRuntimeContext();
  const owner =
    !insideEditable && runtimeContext
      ? getEditorRuntimeOwner(runtimeContext.runtime)
      : null;
  const fallbackRoot = contextEditor?.read.view.root();
  const subscribe = useCallback(
    (listener: () => void) =>
      owner ? subscribeActiveCaretRoot(owner, listener) : () => {},
    [owner]
  );
  const readTargetRoot = useCallback((): NamedRootKey | undefined => {
    if (!owner) return undefined;
    const activeRoot = getActiveCaretRoot(owner);

    return activeRoot !== null ? toPublicRoot(activeRoot) : fallbackRoot;
  }, [fallbackRoot, owner]);
  const targetRoot = useSyncExternalStore(
    owner ? subscribe : NOOP_SUBSCRIBE,
    owner ? readTargetRoot : RETURN_UNDEFINED,
    owner ? readTargetRoot : RETURN_UNDEFINED
  );

  if (!contextEditor) return null;
  if (insideEditable || !runtimeContext) {
    return contextEditor as EditorContextValue;
  }

  return runtimeContext.rootEditor(targetRoot) as EditorContextValue;
}

/**
 * Return the active command editor from the nearest `<EditorRoot>`.
 *
 * Inside an editing area (`<EditorContent>`), returns that editing area's own
 * editor. Outside editing areas, such as in a toolbar, returns the root editor
 * for the root holding the caret, or the enclosing `<EditorRoot>`'s root while
 * nothing is selected. Throws outside `<EditorRoot>`.
 */
export function useEditor(): EditorContextValue {
  if (arguments.length > 0) {
    throw new Error(
      'useEditor() takes no arguments. Call useCreateEditor(options, deps) to create an editor.'
    );
  }

  const editor = useOptionalEditor();

  if (!editor) {
    throw new Error('The `useEditor` hook must be used inside <EditorRoot>.');
  }

  return editor;
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
 * Without `root`, the command runs in the root of the `EditorContent` around the
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
