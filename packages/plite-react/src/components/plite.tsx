import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  createEditorView,
  type EditorCommit,
  type EditorSnapshot,
  isEditor,
  type Operation,
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
import { Editor, getOperationCount } from '../editable/runtime-editor-api';
import {
  createRootSelectionCache,
  getSelectionRoot,
} from '../hooks/root-selection-cache';
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
  syncPliteNodePathBindingsToDOM,
  syncTextOperationsToDOM,
} from '../hooks/use-plite-node-ref';
import {
  createReactRuntimeViewEditor,
  createPliteViewEffectQueue,
  type PliteContentRootOwner,
  PliteRuntimeContext,
  type PliteRuntimeValue,
  useOptionalPliteRuntimeContext,
} from '../hooks/use-plite-runtime';
import { ReactEditor, type ReactRuntimeEditor } from '../plugin/react-editor';
import type {
  ReactEditorContextValue,
  ReactEditor as ReactEditorType,
} from '../plugin/with-react';
import { ProjectionContext } from '../projection-context';
import { recordPliteReactRender } from '../render-profiler';
import { REACT_MAJOR_VERSION } from '../utils/environment';
import { setPliteViewSelectionStoreKey } from '../view-selection';

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

const getOperationRoot = (operation: Operation): RootKey =>
  ((operation as { root?: RootKey }).root ?? 'main') as RootKey;

const getMainRootOperations = (operations: readonly Operation[]) =>
  operations.every((operation) => getOperationRoot(operation) === 'main')
    ? operations
    : operations.filter((operation) => getOperationRoot(operation) === 'main');

type RuntimeContentRootOwner = PliteContentRootOwner & {
  ownerPath: Path;
};

const getContentRootOwnerKey = (owner: RuntimeContentRootOwner) =>
  `${owner.ownerRoot}\u0000${owner.ownerPath.join('.')}\u0000${owner.childRoot}`;

const isTextOperation = (operation: Operation) =>
  operation.type === 'insert_text' || operation.type === 'remove_text';

const getTextOperations = (operations: readonly Operation[]) =>
  operations.every(isTextOperation)
    ? operations
    : operations.filter(isTextOperation);

const isRootValueChanged = (root: RootKey, commit: EditorCommit) =>
  commit.childrenChanged &&
  (commit.fullDocumentChanged ||
    commit.operations.some(
      (operation) => getOperationRoot(operation) === root
    ));

const isRootSelectionChanged = (root: RootKey, commit: EditorCommit) =>
  commit.selectionChanged &&
  (getSelectionRoot(commit.selectionBefore) === root ||
    getSelectionRoot(commit.selectionAfter) === root);

const isRootMarksChanged = (root: RootKey, commit: EditorCommit) =>
  commit.marksChanged &&
  (getSelectionRoot(commit.selectionBefore) === root ||
    getSelectionRoot(commit.selectionAfter) === root);

/** Snapshot payload passed to Plite React change callbacks. */
export type PliteChange<V extends Value = Value> = {
  commit: EditorCommit<V>;
  marksChanged: boolean;
  operations: EditorCommit<V>['operations'];
  selection: EditorSnapshot<V>['selection'];
  selectionChanged: boolean;
  snapshot: EditorSnapshot<V>;
  tags: EditorCommit<V>['tags'];
  value: V;
  valueChanged: boolean;
};

/** Props for the Plite React provider around editable roots and callbacks. */
export type PliteProps<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly unknown[],
> = {
  editor?: ReactEditorType<V, TExtensions>;
  annotationStore?: PliteAnnotationStore<any, any> | null;
  children: React.ReactNode;
  decorationSources?: readonly PliteDecorationSource<any>[] | null;
  onChange?: (value: V, change: PliteChange<V>) => void;
  onSelectionChange?: (
    selection: EditorSnapshot<V>['selection'],
    change: PliteChange<V>
  ) => void;
  onValueChange?: (value: V, change: PliteChange<V>) => void;
  readOnly?: boolean;
  root?: RootKey;
};

/**
 * A wrapper around the provider to publish committed editor snapshots, because
 * the editor is a mutable singleton.
 */

export const Plite = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly unknown[],
>(
  props: PliteProps<V, TExtensions>
) => {
  const runtimeContext = useOptionalPliteRuntimeContext();

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
  onChange,
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
  const reactEditor = editor as unknown as ReactRuntimeEditor<V>;
  const viewRoot = editor.read((state) => state.view.root());
  const isFocused = ReactEditor.isFocused(reactEditor);
  useIsomorphicLayoutEffect(
    () => registerViewEditor(reactEditor, viewRoot),
    [reactEditor, registerViewEditor, viewRoot]
  );
  usePliteChangeCallbacks({
    editor: reactEditor,
    onChange,
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
            value={editor as ReactEditorContextValue<any>}
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

const usePliteChangeCallbacks = <V extends Value>({
  editor,
  onChange,
  onSelectionChange,
  onValueChange,
  root,
}: {
  editor: ReactRuntimeEditor<V>;
  onChange?: (value: V, change: PliteChange<V>) => void;
  onSelectionChange?: (
    selection: EditorSnapshot<V>['selection'],
    change: PliteChange<V>
  ) => void;
  onValueChange?: (value: V, change: PliteChange<V>) => void;
  root: RootKey;
}) => {
  const onChangeRef = useRef(onChange);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onValueChangeRef = useRef(onValueChange);
  const editorBaseline = useMemo(
    () => ({
      commitVersion: Editor.getLastCommit(editor)?.version ?? 0,
      snapshot: Editor.getSnapshot(editor),
    }),
    [editor]
  );
  const lastSnapshotRef = useRef(Editor.getSnapshot(editor));
  const lastCommitVersionRef = useRef(
    Editor.getLastCommit(editor)?.version ?? 0
  );
  const hasCallbacks = !!(onChange || onSelectionChange || onValueChange);

  useIsomorphicLayoutEffect(() => {
    onChangeRef.current = onChange;
    onSelectionChangeRef.current = onSelectionChange;
    onValueChangeRef.current = onValueChange;
  }, [onChange, onSelectionChange, onValueChange]);

  useIsomorphicLayoutEffect(() => {
    lastSnapshotRef.current = editorBaseline.snapshot;
    lastCommitVersionRef.current = editorBaseline.commitVersion;

    if (!hasCallbacks) {
      return;
    }

    const onContextChange: Parameters<
      ReactRuntimeEditor<V>['subscribeCommit']
    >[0] = (commit) => {
      const snapshot = Editor.getSnapshot(editor);
      const previousSnapshot = lastSnapshotRef.current as EditorSnapshot<V>;
      const valueChanged =
        isRootValueChanged(root, commit) &&
        previousSnapshot.children !== snapshot.children;
      const selectionChanged =
        commit.selectionChanged &&
        !isSelectionEqual(previousSnapshot.selection, snapshot.selection);
      const marksChanged = commit.marksChanged && snapshot.selection !== null;

      lastSnapshotRef.current = snapshot;
      lastCommitVersionRef.current = commit.version;

      if (!valueChanged && !selectionChanged && !marksChanged) {
        return;
      }

      const value = snapshot.children as V;
      const change: PliteChange<V> = {
        commit: commit as EditorCommit<V>,
        marksChanged,
        operations: commit.operations as EditorCommit<V>['operations'],
        selection: snapshot.selection,
        selectionChanged,
        snapshot,
        tags: commit.tags,
        value,
        valueChanged,
      };

      onChangeRef.current?.(value, change);

      if (valueChanged) {
        onValueChangeRef.current?.(value, change);
      }

      if (selectionChanged) {
        onSelectionChangeRef.current?.(snapshot.selection, change);
      }
    };

    const unsubscribe = editor.subscribeCommit(onContextChange);
    const latestCommit = Editor.getLastCommit(editor);

    if (latestCommit && latestCommit.version > lastCommitVersionRef.current) {
      onContextChange(latestCommit);
    }

    return unsubscribe;
  }, [editor, editorBaseline, hasCallbacks, root]);
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
    onChange,
    onSelectionChange,
    onValueChange,
    readOnly = false,
  } = props;

  if (!isEditor(editor)) {
    throw new Error('[Plite] editor is invalid!');
  }

  const reactEditor = editor as unknown as ReactRuntimeEditor<V>;
  const { selectorContext, onChange: handleSelectorChange } =
    useEditorSelectorContext();
  const onChangeRef = useRef(onChange);
  const onSelectionChangeRef = useRef(onSelectionChange);
  const onValueChangeRef = useRef(onValueChange);
  const lastOperationCountRef = useRef(getOperationCount(editor));
  const lastCommitVersionRef = useRef(
    Editor.getLastCommit(editor)?.version ?? 0
  );
  const lastEditorRef = useRef(editor);
  const mountedViewEditorsRef = useRef(
    new Map<RootKey, Set<ReactRuntimeEditor<V>>>()
  );
  const activeViewEditorsRef = useRef(
    new Map<RootKey, ReactRuntimeEditor<V>>()
  );
  const contentRootOwnersRef = useRef(
    new Map<ReactRuntimeEditor<V>, RuntimeContentRootOwner>()
  );
  const contentRootOwnerViewEditorsRef = useRef(
    new Map<string, ReactRuntimeEditor<V>>()
  );
  const [viewEffectQueue] = useState(createPliteViewEffectQueue);
  const [viewEffectVersion, setViewEffectVersion] = useState(0);
  const lastSelectionCacheRef = useRef(createRootSelectionCache());

  onChangeRef.current = onChange;
  onSelectionChangeRef.current = onSelectionChange;
  onValueChangeRef.current = onValueChange;

  if (lastEditorRef.current !== editor) {
    lastEditorRef.current = editor;
    lastOperationCountRef.current = getOperationCount(editor);
    lastCommitVersionRef.current = Editor.getLastCommit(editor)?.version ?? 0;
  }

  const runtime = useMemo(
    () =>
      Object.freeze({
        api: editor.api,
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
    (viewEditor: ReactRuntimeEditor<V>, root: RootKey) => {
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
    (viewEditor: ReactRuntimeEditor<V>, root: RootKey) => {
      const viewEditors = mountedViewEditorsRef.current.get(root);

      if (viewEditors?.has(viewEditor) || root === 'main') {
        activeViewEditorsRef.current.set(root, viewEditor);
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

      return (viewEditor ??
        (root === 'main' ? reactEditor : null)) as ReactRuntimeEditor<V> | null;
    },
    [reactEditor]
  );
  const registerContentRootOwner = useCallback(
    (viewEditor: ReactRuntimeEditor<V>, owner: RuntimeContentRootOwner) => {
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
  const syncMountedRootTextOperationsToDOM = useCallback(
    (operations: readonly Operation[]) => {
      if (mountedViewEditorsRef.current.size === 0) {
        return { syncedTextOperationCount: 0, textOperationCount: 0 };
      }

      const textOperations = getTextOperations(operations);

      if (textOperations.length === 0) {
        return { syncedTextOperationCount: 0, textOperationCount: 0 };
      }

      const operationsByRoot = new Map<RootKey, Operation[]>();

      for (const operation of textOperations) {
        const root = getOperationRoot(operation);
        const rootOperations = operationsByRoot.get(root) ?? [];

        rootOperations.push(operation);
        operationsByRoot.set(root, rootOperations);
      }

      for (const [root, rootOperations] of operationsByRoot) {
        const viewEditors = mountedViewEditorsRef.current.get(root);

        if (!viewEditors) {
          continue;
        }

        for (const viewEditor of viewEditors) {
          const textSync = syncTextOperationsToDOM(viewEditor, rootOperations);

          if (textSync.syncedTextOperationCount < textSync.textOperationCount) {
            return {
              syncedTextOperationCount: 0,
              textOperationCount: textOperations.length,
            };
          }
        }
      }

      return {
        syncedTextOperationCount: textOperations.length,
        textOperationCount: textOperations.length,
      };
    },
    []
  );
  useIsomorphicLayoutEffect(() => {
    const maybeBatchUpdates =
      REACT_MAJOR_VERSION < 18
        ? ReactDOM.unstable_batchedUpdates
        : (callback: () => void) => callback();

    const onContextChange: Parameters<typeof editor.subscribeCommit>[0] = (
      commit
    ) => {
      lastSelectionCacheRef.current.record(commit.selectionAfter);

      const nextOperations = commit.operations;

      lastSelectionCacheRef.current.recordOperations(nextOperations);

      lastOperationCountRef.current += nextOperations.length;
      lastCommitVersionRef.current = commit.version;

      maybeBatchUpdates(() => {
        profileRuntimeDuration('focused-state', () => {
          setIsFocused(ReactEditor.isFocused(reactEditor));
        });
        const mainOperations = getMainRootOperations(nextOperations);
        const textSync = profileRuntimeDuration('dom-text-sync', () =>
          syncTextOperationsToDOM(reactEditor, mainOperations)
        );
        const rootTextSync = profileRuntimeDuration('dom-root-text-sync', () =>
          syncMountedRootTextOperationsToDOM(nextOperations)
        );
        if (
          commit &&
          (commit.fullDocumentChanged ||
            commit.rootRuntimeIdsChanged ||
            commit.structureChanged ||
            commit.topLevelOrderChanged)
        ) {
          profileRuntimeDuration('dom-path-sync', () =>
            syncPliteNodePathBindingsToDOM(reactEditor)
          );
        }
        const hasUnsyncedTextOperation =
          textSync.textOperationCount > textSync.syncedTextOperationCount ||
          rootTextSync.textOperationCount >
            rootTextSync.syncedTextOperationCount;

        profileRuntimeDuration('change-callbacks', () => {
          if (
            !onChangeRef.current &&
            !onSelectionChangeRef.current &&
            !onValueChangeRef.current
          ) {
            return;
          }

          const valueChanged = isRootValueChanged('main', commit);
          const selectionChanged = isRootSelectionChanged('main', commit);
          const marksChanged = isRootMarksChanged('main', commit);

          if (!valueChanged && !selectionChanged && !marksChanged) {
            return;
          }

          const snapshot = profileRuntimeDuration(
            'change-callbacks-snapshot',
            () => Editor.getSnapshot(editor)
          );
          const value = snapshot.children as V;
          const change: PliteChange<V> = {
            commit: commit as EditorCommit<V>,
            marksChanged,
            operations: commit.operations as EditorCommit<V>['operations'],
            selection: snapshot.selection,
            selectionChanged,
            snapshot: snapshot as EditorSnapshot<V>,
            tags: commit.tags,
            value,
            valueChanged,
          };

          onChangeRef.current?.(value, change);

          if (valueChanged) {
            onValueChangeRef.current?.(value, change);
          }

          if (selectionChanged) {
            onSelectionChangeRef.current?.(snapshot.selection, change);
          }
        });

        profileRuntimeDuration('selector-dispatch', () =>
          handleSelectorChange(
            hasUnsyncedTextOperation ? undefined : nextOperations,
            commit
          )
        );

        if (viewEffectQueue.hasEffects()) {
          setViewEffectVersion((version) => version + 1);
        }
      });
    };

    const unsubscribe = editor.subscribeCommit(onContextChange);
    const latestCommit = Editor.getLastCommit(editor);

    if (latestCommit && latestCommit.version > lastCommitVersionRef.current) {
      onContextChange(latestCommit);
    }

    return unsubscribe;
  }, [
    editor,
    handleSelectorChange,
    reactEditor,
    syncMountedRootTextOperationsToDOM,
    viewEffectQueue,
  ]);

  const [isFocused, setIsFocused] = useState(
    ReactEditor.isFocused(reactEditor)
  );
  const [focusVersion, setFocusVersion] = useState(0);
  const projectionContextValue = useMemo(() => {
    if (!annotationStore) {
      return composeDecorationSources(decorationSources);
    }

    return composeProjectionSources([
      ...(decorationSources ?? []),
      annotationStore.projectionStore,
    ]);
  }, [annotationStore, decorationSources]);

  useEffect(() => {
    setIsFocused(ReactEditor.isFocused(reactEditor));
  }, [reactEditor]);

  useIsomorphicLayoutEffect(() => {
    const fn = () => {
      setIsFocused(ReactEditor.isFocused(reactEditor));
      setFocusVersion((version) => version + 1);
      queueMicrotask(() => {
        setIsFocused(ReactEditor.isFocused(reactEditor));
        setFocusVersion((version) => version + 1);
      });
    };
    if (REACT_MAJOR_VERSION >= 17) {
      // In React >= 17 onFocus and onBlur listen to the focusin and focusout events during the bubbling phase.
      // Therefore in order for <Editable />'s handlers to run first, which is necessary for ReactEditor.isFocused(editor)
      // to return the correct value, we have to listen to the focusin and focusout events without useCapture here.
      document.addEventListener('focusin', fn);
      document.addEventListener('focusout', fn);
      return () => {
        document.removeEventListener('focusin', fn);
        document.removeEventListener('focusout', fn);
      };
    }
    document.addEventListener('focus', fn, true);
    document.addEventListener('blur', fn, true);
    return () => {
      document.removeEventListener('focus', fn, true);
      document.removeEventListener('blur', fn, true);
    };
  }, [reactEditor]);

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
            <EditorContext.Provider
              value={editor as ReactEditorContextValue<any>}
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
