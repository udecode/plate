import React, {
  useCallback,
  useInsertionEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import {
  createEditorView,
  type EditorCommit,
  type EditorCommitContext,
  type EditorSnapshot,
  isEditor,
  type NamedRootKey,
  type Path,
  RangeApi,
  type RootKey,
  type Selection,
  type Value,
} from '@platejs/plite';
import { EDITOR_TO_ROOT_VIEW_EDITORS } from '@platejs/plite-dom/internal';
import type { PliteAnnotationStore } from '../annotation-store';
import {
  composeDecorationSources,
  composeProjectionSources,
  type PliteDecorationSource,
} from '../decoration-source';
import {
  getEditorRuntimeOwner,
  getLastCommit as editorGetLastCommit,
  getSnapshot as editorGetSnapshot,
  toInternalRoot,
} from '../editable/runtime-editor-api';
import { getSchemaInvalidatedRuntimeIds } from '../editable/schema-runtime-invalidation';
import { createRootSelectionCache } from '../hooks/root-selection-cache';
import { EditorContext } from '../hooks/use-editor';
import { FocusedContext } from '../hooks/use-editor-focused';
import { ReadOnlyContext } from '../hooks/use-editor-read-only';
import {
  EditorSelectorContext,
  useEditorSelectorContext,
} from '../hooks/use-editor-selector';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import { PliteAnnotationStoreContext } from '../hooks/use-plite-annotations';
import {
  syncChangedTextToDOM,
  syncPliteNodePathBindingsToDOM,
} from '../hooks/use-plite-node-ref';
import {
  createReactRuntimeViewEditor,
  createPliteViewEffectQueue,
  type PliteContentRootOwner,
  PliteRuntimeContext,
  type PliteRuntimeValue,
  useOptionalPliteRuntimeContext,
} from '../hooks/use-plite-runtime';
import { useRuntimeFocusState } from '../hooks/use-runtime-focus-state';
import {
  ReactEditor,
  type ReactRuntimeEditor,
  toReactRuntimeEditor,
} from '../plugin/react-editor';
import type {
  ReactEditorContextValue,
  ReactEditor as ReactEditorType,
} from '../plugin/with-react';
import { EditorAnnouncementLiveRegion } from './editor-announcement-live-region';
import { ProjectionContext } from '../projection-context';
import { recordPliteReactRender } from '../render-profiler';
import { REACT_MAJOR_VERSION } from '../utils/environment';
import { setPliteViewSelectionStoreKey } from '../view-selection';
import { toPublicRootOption } from '../root-key';

const now = () => globalThis.performance?.now?.() ?? Date.now();

const profileRuntimeDuration = <T,>(id: string, callback: () => T): T => {
  if (!globalThis.__PLITE_REACT_RENDER_PROFILER__) {
    return callback();
  }

  const start = now();

  try {
    return callback();
  } finally {
    recordPliteReactRender({
      duration: now() - start,
      id,
      kind: 'runtime-time',
    });
  }
};

const isSelectionEqual = (a: Selection, b: Selection) => {
  if (!a && !b) return true;
  if (!a || !b) return false;

  return RangeApi.equals(a, b);
};

type RuntimeContentRootOwner = PliteContentRootOwner & {
  ownerPath: Path;
};

const getContentRootOwnerKey = (owner: RuntimeContentRootOwner) =>
  `${owner.ownerRoot}\u0000${owner.ownerPath.join('.')}\u0000${owner.childRoot}`;

const isRootValueChanged = (root: RootKey, commit: EditorCommit) =>
  commit.changed.has('document', toPublicRootOption(root));

const selectionIsInRoot = (
  selection: Selection,
  selectionRoot: RootKey | undefined,
  root: RootKey
) => selection !== null && toInternalRoot(selectionRoot) === root;

const isRootSelectionChanged = (root: RootKey, commit: EditorCommit) =>
  commit.selectionChanged &&
  (selectionIsInRoot(
    commit.selectionBefore,
    commit.selectionBeforeRoot,
    root
  ) ||
    selectionIsInRoot(commit.selectionAfter, commit.selectionAfterRoot, root));

type PliteChangeCallbacks<
  V extends Value,
  TExtensions extends readonly unknown[],
> = {
  onCommit?: (context: PliteCommitContext<V, TExtensions>) => void;
  onSelectionChange?: (
    context: PliteSelectionChangeContext<V, TExtensions>
  ) => void;
  onValueChange?: (context: PliteValueChangeContext<V, TExtensions>) => void;
};

const useCommittedChangeCallbackCell = <
  V extends Value,
  TExtensions extends readonly unknown[],
>(
  callbacks: PliteChangeCallbacks<V, TExtensions>
) => {
  const [cell] = useState(() => ({ current: callbacks }));

  useInsertionEffect(() => {
    cell.current = callbacks;
  }, [callbacks, cell]);

  return cell;
};

type PendingEditorCommit<V extends Value> = {
  commit: EditorCommit;
  snapshot: EditorSnapshot<V>;
};

type EditorCommitPublicationQueue<V extends Value> = {
  lastVersion: number;
  pending: Map<number, PendingEditorCommit<V>>;
  publishing: boolean;
};

const createEditorCommitPublicationQueue = <V extends Value>(
  lastVersion: number
): EditorCommitPublicationQueue<V> => ({
  lastVersion,
  pending: new Map(),
  publishing: false,
});

const resetEditorCommitPublicationQueue = <V extends Value>(
  queue: EditorCommitPublicationQueue<V>,
  lastVersion: number
) => {
  queue.lastVersion = lastVersion;
  queue.pending.clear();
  queue.publishing = false;
};

const publishEditorCommitInVersionOrder = <V extends Value>(
  queue: EditorCommitPublicationQueue<V>,
  commit: EditorCommit,
  snapshot: EditorSnapshot<V>,
  publish: (commit: EditorCommit, snapshot: EditorSnapshot<V>) => void,
  options: { allowVersionGap?: boolean } = {}
) => {
  if (commit.version <= queue.lastVersion) return;

  queue.pending.set(commit.version, { commit, snapshot });
  if (queue.publishing) return;

  queue.publishing = true;

  try {
    let allowVersionGap = options.allowVersionGap ?? false;

    while (queue.pending.size > 0) {
      let nextVersion = queue.lastVersion + 1;
      let next = queue.pending.get(nextVersion);

      if (!next && allowVersionGap) {
        nextVersion = Math.min(...queue.pending.keys());
        next = queue.pending.get(nextVersion);
      }
      if (!next) break;

      queue.pending.delete(nextVersion);
      queue.lastVersion = nextVersion;
      publish(next.commit, next.snapshot);
      allowVersionGap = false;
    }
  } finally {
    queue.publishing = false;
  }
};

/** Canonical commit payload observed by a Plite React provider. */
export type PliteCommitContext<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly unknown[],
> = EditorCommitContext<ReactEditorType<V, TExtensions>>;

/** Value-change payload derived independently from a canonical commit. */
export type PliteValueChangeContext<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly unknown[],
> = PliteCommitContext<V, TExtensions> & {
  value: V;
};

/** Selection-change payload derived independently from a canonical commit. */
export type PliteSelectionChangeContext<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly unknown[],
> = PliteCommitContext<V, TExtensions> & {
  selection: EditorSnapshot<V>['selection'];
};

/** Props for the Plite React provider around editable roots and callbacks. */
export type PliteProps<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly unknown[],
  TRoot extends RootKey = RootKey,
> = {
  editor?: ReactEditorType<V, TExtensions>;
  annotationStore?: PliteAnnotationStore<any, any> | null;
  children: React.ReactNode;
  decorationSources?: readonly PliteDecorationSource<any>[] | null;
  onCommit?: (context: PliteCommitContext<V, TExtensions>) => void;
  onSelectionChange?: (
    context: PliteSelectionChangeContext<V, TExtensions>
  ) => void;
  onValueChange?: (context: PliteValueChangeContext<V, TExtensions>) => void;
  readOnly?: boolean;
  root?: NamedRootKey<TRoot>;
};

/**
 * A wrapper around the provider to publish committed editor snapshots, because
 * the editor is a mutable singleton.
 */

export const Plite = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly unknown[],
  const TRoot extends RootKey = RootKey,
>(
  props: PliteProps<V, TExtensions, TRoot>
) => {
  const runtimeContext = useOptionalPliteRuntimeContext();

  if (props.root === 'main') {
    throw new Error('[Plite] Omit root to render the primary document.');
  }

  if (props.editor && props.root) {
    throw new Error('[Plite] Pass either editor or root, not both.');
  }

  if (!props.editor) {
    if (!runtimeContext) {
      if (props.root) {
        throw new Error('[Plite] Plite roots require <PliteRuntime>.');
      }

      throw new Error('[Plite] editor is invalid!');
    }

    return <PliteRuntimeView {...props} runtimeContext={runtimeContext} />;
  }

  if (
    runtimeContext &&
    getEditorRuntimeOwner(runtimeContext.runtime.editor) ===
      getEditorRuntimeOwner(props.editor)
  ) {
    const editorRoot = props.editor.read((state) => state.view.root());

    return (
      <PliteRuntimeView
        {...props}
        root={editorRoot === 'main' ? undefined : editorRoot}
        runtimeContext={runtimeContext}
      />
    );
  }

  return <PliteSingleEditor {...props} editor={props.editor} />;
};

type PliteRuntimeViewProps<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly unknown[],
> = PliteProps<V, TExtensions> & {
  runtimeContext: NonNullable<
    ReturnType<typeof useOptionalPliteRuntimeContext>
  >;
};

const PliteRuntimeView = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly unknown[],
>({
  annotationStore = null,
  children,
  decorationSources = null,
  onCommit,
  onSelectionChange,
  onValueChange,
  readOnly = false,
  root,
  runtimeContext,
}: PliteRuntimeViewProps<V, TExtensions>) => {
  const { getView, registerViewEditor } = runtimeContext;
  const editor = useMemo(() => {
    const view = getView({
      readOnly,
      root,
    });

    const viewEditor = createReactRuntimeViewEditor(view);

    setPliteViewSelectionStoreKey(viewEditor, runtimeContext.runtime.editor);

    return viewEditor;
  }, [getView, readOnly, root, runtimeContext.runtime.editor]);
  const reactEditor = editor;
  const viewRoot = toInternalRoot(editor.read((state) => state.view.root()));
  const isFocused = ReactEditor.isFocused(reactEditor);
  useIsomorphicLayoutEffect(
    () => registerViewEditor(reactEditor, viewRoot),
    [reactEditor, registerViewEditor, viewRoot]
  );
  usePliteChangeCallbacks({
    editor: reactEditor,
    onCommit,
    onSelectionChange,
    onValueChange,
    root: viewRoot,
  });
  const projectionContextValue = useMemo(() => {
    if (!annotationStore) {
      return composeDecorationSources(decorationSources);
    }

    return composeProjectionSources([
      ...(decorationSources ?? []),
      annotationStore.projectionStore,
    ]);
  }, [annotationStore, decorationSources]);

  return (
    <EditorSelectorContext.Provider value={runtimeContext.selectorContext}>
      <ProjectionContext.Provider value={projectionContextValue}>
        <PliteAnnotationStoreContext.Provider value={annotationStore}>
          <EditorContext.Provider
            value={reactEditor as unknown as ReactEditorContextValue<any>}
          >
            <ReadOnlyContext.Provider value={readOnly}>
              <FocusedContext.Provider value={isFocused}>
                {children}
              </FocusedContext.Provider>
            </ReadOnlyContext.Provider>
          </EditorContext.Provider>
        </PliteAnnotationStoreContext.Provider>
      </ProjectionContext.Provider>
    </EditorSelectorContext.Provider>
  );
};

type PliteSingleEditorProps<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly unknown[],
> = PliteProps<V, TExtensions> & {
  editor: ReactEditorType<V, TExtensions>;
};

const usePliteChangeCallbacks = <
  V extends Value,
  TExtensions extends readonly unknown[],
>({
  editor,
  onCommit,
  onSelectionChange,
  onValueChange,
  root,
}: {
  editor: ReactRuntimeEditor<V, TExtensions>;
  onCommit?: (context: PliteCommitContext<V, TExtensions>) => void;
  onSelectionChange?: (
    context: PliteSelectionChangeContext<V, TExtensions>
  ) => void;
  onValueChange?: (context: PliteValueChangeContext<V, TExtensions>) => void;
  root: RootKey;
}) => {
  const changeCallbacks = useMemo(
    () => ({ onCommit, onSelectionChange, onValueChange }),
    [onCommit, onSelectionChange, onValueChange]
  );
  const changeCallbacksCell = useCommittedChangeCallbackCell(changeCallbacks);
  const editorBaseline = useMemo(
    () => ({
      commitVersion: editorGetLastCommit(editor)?.version ?? 0,
      snapshot: editorGetSnapshot(editor),
    }),
    [editor]
  );
  const lastSnapshotRef = useRef(editorGetSnapshot(editor));
  const [commitPublicationQueue] = useState(() =>
    createEditorCommitPublicationQueue<V>(editorBaseline.commitVersion)
  );

  useIsomorphicLayoutEffect(() => {
    lastSnapshotRef.current = editorBaseline.snapshot;
    resetEditorCommitPublicationQueue(
      commitPublicationQueue,
      editorBaseline.commitVersion
    );

    const publishContextChange = (
      commit: EditorCommit,
      snapshot: EditorSnapshot<V>
    ) => {
      const previousSnapshot = lastSnapshotRef.current as EditorSnapshot<V>;
      const valueChanged =
        isRootValueChanged(root, commit) &&
        previousSnapshot.children !== snapshot.children;
      const selectionChanged =
        commit.selectionChanged &&
        !isSelectionEqual(previousSnapshot.selection, snapshot.selection);
      lastSnapshotRef.current = snapshot;

      const context = {
        commit,
        editor,
        snapshot,
      } as unknown as PliteCommitContext<V, TExtensions>;
      const { onCommit, onSelectionChange, onValueChange } =
        changeCallbacksCell.current;

      onCommit?.(context);

      if (valueChanged) {
        onValueChange?.({
          ...context,
          value: snapshot.children as V,
        });
      }

      if (selectionChanged) {
        onSelectionChange?.({
          ...context,
          selection: snapshot.selection,
        });
      }
    };
    const onContextChange: Parameters<
      ReactRuntimeEditor<V, TExtensions>['subscribeCommit']
    >[0] = (commit, snapshot) => {
      publishEditorCommitInVersionOrder(
        commitPublicationQueue,
        commit,
        snapshot,
        publishContextChange
      );
    };

    const unsubscribe = editor.subscribeCommit(onContextChange);
    const latestCommit = editorGetLastCommit(editor);

    if (
      latestCommit &&
      latestCommit.version > commitPublicationQueue.lastVersion
    ) {
      publishEditorCommitInVersionOrder(
        commitPublicationQueue,
        latestCommit,
        editorGetSnapshot(editor),
        publishContextChange,
        { allowVersionGap: true }
      );
    }

    return unsubscribe;
  }, [
    changeCallbacksCell,
    commitPublicationQueue,
    editor,
    editorBaseline,
    root,
  ]);
};

const PliteSingleEditor = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly unknown[],
>(
  props: PliteSingleEditorProps<V, TExtensions>
) => {
  const {
    annotationStore = null,
    decorationSources = null,
    editor,
    children,
    onCommit,
    onSelectionChange,
    onValueChange,
    readOnly = false,
  } = props;

  if (!isEditor(editor)) {
    throw new Error('[Plite] editor is invalid!');
  }

  const reactEditor = toReactRuntimeEditor(editor);
  const { selectorContext, onChange: handleSelectorChange } =
    useEditorSelectorContext();
  const {
    focused: isFocused,
    focusVersion,
    refreshFocused,
  } = useRuntimeFocusState(reactEditor);
  const editorBaselineVersion = useMemo(
    () => editorGetLastCommit(editor)?.version ?? 0,
    [editor]
  );
  const committedEditorRef = useRef(editor);
  const changeCallbacks = useMemo(
    () => ({ onCommit, onSelectionChange, onValueChange }),
    [onCommit, onSelectionChange, onValueChange]
  );
  const changeCallbacksCell = useCommittedChangeCallbackCell(changeCallbacks);
  const [commitPublicationQueue] = useState(() =>
    createEditorCommitPublicationQueue<V>(editorBaselineVersion)
  );
  const mountedViewEditorsRef = useRef(
    new Map<RootKey, Set<typeof reactEditor>>()
  );
  const activeViewEditorsRef = useRef(new Map<RootKey, typeof reactEditor>());
  const contentRootOwnersRef = useRef(
    new Map<typeof reactEditor, RuntimeContentRootOwner>()
  );
  const contentRootOwnerViewEditorsRef = useRef(
    new Map<string, typeof reactEditor>()
  );
  const activeContentRootOwnersRef = useRef(
    new Map<RootKey, RuntimeContentRootOwner>()
  );
  const [viewEffectQueue] = useState(createPliteViewEffectQueue);
  const [viewEffectVersion, setViewEffectVersion] = useState(0);
  const lastSelectionCacheRef = useRef(createRootSelectionCache());

  const runtime = useMemo(
    () =>
      Object.freeze({
        api: editor.api,
        anchor: editor.anchor,
        editor,
        extend: editor.extend,
        getApi: editor.getApi,
        read: editor.read,
        subscribe: editor.subscribe,
        subscribeCommit: editor.subscribeCommit,
        update: editor.update,
      }) as PliteRuntimeValue<V, TExtensions>,
    [editor]
  );
  const getView = useCallback(
    (options = {}) => createEditorView(runtime, options),
    [runtime]
  );
  const registerViewEditor = useCallback(
    (viewEditor: typeof reactEditor, root: RootKey) => {
      const viewEditors = mountedViewEditorsRef.current.get(root) ?? new Set();
      const rootViewEditors =
        EDITOR_TO_ROOT_VIEW_EDITORS.get(editor) ?? new Set();

      viewEditors.add(viewEditor);
      mountedViewEditorsRef.current.set(root, viewEditors);
      if (!activeViewEditorsRef.current.has(root)) {
        activeViewEditorsRef.current.set(root, viewEditor);
      }
      rootViewEditors.add(viewEditor);
      EDITOR_TO_ROOT_VIEW_EDITORS.set(editor, rootViewEditors);

      return () => {
        viewEditors.delete(viewEditor);
        rootViewEditors.delete(viewEditor);
        const owner = contentRootOwnersRef.current.get(viewEditor);

        contentRootOwnersRef.current.delete(viewEditor);
        if (owner) {
          contentRootOwnerViewEditorsRef.current.delete(
            getContentRootOwnerKey(owner)
          );
        }

        if (activeViewEditorsRef.current.get(root) === viewEditor) {
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
          EDITOR_TO_ROOT_VIEW_EDITORS.delete(editor);
        }
      };
    },
    [editor]
  );
  const setActiveViewEditor = useCallback(
    (viewEditor: typeof reactEditor, root: RootKey) => {
      const viewEditors = mountedViewEditorsRef.current.get(root);

      if (viewEditors?.has(viewEditor) || root === 'main') {
        activeViewEditorsRef.current.set(root, viewEditor);
        const owner = contentRootOwnersRef.current.get(viewEditor);

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

      return viewEditor ?? (root === 'main' ? reactEditor : null);
    },
    [reactEditor]
  );
  const registerContentRootOwner = useCallback(
    (viewEditor: typeof reactEditor, owner: RuntimeContentRootOwner) => {
      contentRootOwnersRef.current.set(viewEditor, owner);
      contentRootOwnerViewEditorsRef.current.set(
        getContentRootOwnerKey(owner),
        viewEditor
      );

      return () => {
        if (contentRootOwnersRef.current.get(viewEditor) === owner) {
          contentRootOwnersRef.current.delete(viewEditor);
          contentRootOwnerViewEditorsRef.current.delete(
            getContentRootOwnerKey(owner)
          );
        }
      };
    },
    []
  );
  const getContentRootOwnerViewEditor = useCallback(
    (owner: RuntimeContentRootOwner) =>
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
  const syncMountedRootChangesToDOM = useCallback((commit: EditorCommit) => {
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
  const handleCommittedEditorChange = useCallback(
    (commit: EditorCommit, snapshot: EditorSnapshot<V>) => {
      lastSelectionCacheRef.current.record(
        commit.selectionAfter,
        commit.selectionAfterRoot
      );

      const maybeBatchUpdates =
        REACT_MAJOR_VERSION < 18
          ? ReactDOM.unstable_batchedUpdates
          : (callback: () => void) => callback();

      maybeBatchUpdates(() => {
        profileRuntimeDuration('focused-state', () => {
          refreshFocused();
        });
        const textSync = profileRuntimeDuration('dom-text-sync', () =>
          syncChangedTextToDOM(reactEditor, commit.changed.runtimeIds('text'))
        );
        const rootTextSync = profileRuntimeDuration('dom-root-text-sync', () =>
          syncMountedRootChangesToDOM(commit)
        );
        const mainPathRuntimeIds = commit.changed.runtimeIds('path');

        if (mainPathRuntimeIds.length > 0) {
          profileRuntimeDuration('dom-path-sync', () =>
            syncPliteNodePathBindingsToDOM(reactEditor, mainPathRuntimeIds)
          );
        }
        const hasUnsyncedTextChange =
          commit.changed.hasAny('text') &&
          (textSync.changedTextCount > textSync.syncedTextCount ||
            rootTextSync.changedTextCount > rootTextSync.syncedTextCount);

        profileRuntimeDuration('change-callbacks', () => {
          const { onCommit, onSelectionChange, onValueChange } =
            changeCallbacksCell.current;

          if (!onCommit && !onSelectionChange && !onValueChange) {
            return;
          }

          const valueChanged = isRootValueChanged('main', commit);
          const selectionChanged = isRootSelectionChanged('main', commit);

          const context = {
            commit,
            editor,
            snapshot,
          } as unknown as PliteCommitContext<V, TExtensions>;

          onCommit?.(context);

          if (valueChanged) {
            onValueChange?.({
              ...context,
              value: snapshot.children as V,
            });
          }

          if (selectionChanged) {
            onSelectionChange?.({
              ...context,
              selection: snapshot.selection,
            });
          }
        });

        profileRuntimeDuration('selector-dispatch', () =>
          handleSelectorChange(
            hasUnsyncedTextChange ? undefined : commit,
            getSchemaInvalidatedRuntimeIds(editor, commit)
          )
        );

        if (viewEffectQueue.hasEffects()) {
          setViewEffectVersion((version) => version + 1);
        }
      });
    },
    [
      editor,
      changeCallbacksCell,
      handleSelectorChange,
      reactEditor,
      refreshFocused,
      syncMountedRootChangesToDOM,
      viewEffectQueue,
    ]
  );

  useIsomorphicLayoutEffect(() => {
    if (committedEditorRef.current !== editor) {
      committedEditorRef.current = editor;
      resetEditorCommitPublicationQueue(
        commitPublicationQueue,
        editorBaselineVersion
      );
    }

    const onContextChange: Parameters<typeof editor.subscribeCommit>[0] = (
      commit,
      snapshot
    ) => {
      publishEditorCommitInVersionOrder(
        commitPublicationQueue,
        commit,
        snapshot,
        handleCommittedEditorChange
      );
    };

    const unsubscribe = editor.subscribeCommit(onContextChange);
    const latestCommit = editorGetLastCommit(editor);

    if (
      latestCommit &&
      latestCommit.version > commitPublicationQueue.lastVersion
    ) {
      publishEditorCommitInVersionOrder(
        commitPublicationQueue,
        latestCommit,
        editorGetSnapshot(editor),
        handleCommittedEditorChange,
        { allowVersionGap: true }
      );
    }

    return unsubscribe;
  }, [
    commitPublicationQueue,
    editor,
    editorBaselineVersion,
    handleCommittedEditorChange,
  ]);

  const projectionContextValue = useMemo(() => {
    if (!annotationStore) {
      return composeDecorationSources(decorationSources);
    }

    return composeProjectionSources([
      ...(decorationSources ?? []),
      annotationStore.projectionStore,
    ]);
  }, [annotationStore, decorationSources]);

  useIsomorphicLayoutEffect(() => {
    if (viewEffectVersion === 0) {
      return;
    }

    viewEffectQueue.flush();
  }, [viewEffectQueue, viewEffectVersion]);

  const runtimeContextValue = useMemo(
    () => ({
      focusVersion,
      focused: isFocused,
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
      getMountedViewEditor,
      getActiveContentRootOwner,
      getContentRootOwnerViewEditor,
      getLastSelectionForRoot,
      getView,
      focusVersion,
      isFocused,
      registerContentRootOwner,
      registerViewEffect,
      registerViewEditor,
      runtime,
      selectorContext,
      setActiveViewEditor,
    ]
  );

  return (
    <EditorSelectorContext.Provider value={selectorContext}>
      <ProjectionContext.Provider value={projectionContextValue}>
        <PliteAnnotationStoreContext.Provider value={annotationStore}>
          <PliteRuntimeContext.Provider value={runtimeContextValue as any}>
            <EditorAnnouncementLiveRegion editor={editor} />
            <EditorContext.Provider
              value={reactEditor as unknown as ReactEditorContextValue<any>}
            >
              <ReadOnlyContext.Provider value={readOnly}>
                <FocusedContext.Provider value={isFocused}>
                  {children}
                </FocusedContext.Provider>
              </ReadOnlyContext.Provider>
            </EditorContext.Provider>
          </PliteRuntimeContext.Provider>
        </PliteAnnotationStoreContext.Provider>
      </ProjectionContext.Provider>
    </EditorSelectorContext.Provider>
  );
};
