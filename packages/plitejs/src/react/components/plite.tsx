import React, {
  useCallback,
  useContext,
  useInsertionEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  type EditorCommit,
  type EditorCommitContext,
  type EditorSnapshot,
  isEditor,
  type NamedRootKey,
  type RootKey,
  type Selection,
  SelectionApi,
  type Value,
} from '../..';
import { PliteContentRootOwnerContext } from '../context';
import {
  DecorationContext,
  DecorationRegistrationContext,
  type PliteDecorationRegistrar,
} from '../decoration-context';
import {
  createPliteDecorationManager,
  type PliteDecorationSource,
} from '../decoration-source';
import {
  getEditorRuntimeOwner,
  getLastCommit as editorGetLastCommit,
  getSnapshot as editorGetSnapshot,
  setEditorReadOnly,
  toInternalRoot,
} from '../editable/runtime-editor-api';
import { EditorContext } from '../hooks/use-editor-context';
import { FocusedContext } from '../hooks/use-editor-focused';
import { ReadOnlyContext } from '../hooks/use-editor-read-only';
import { EditorSelectorContext } from '../hooks/use-editor-selector';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import {
  createReactRuntimeViewEditor,
  createEditorCommitPublicationQueue,
  resetEditorCommitPublicationQueue,
  publishEditorCommitInVersionOrder,
  PliteRuntimeProvider,
  type PliteRuntimeValue,
  useRequiredPliteRuntimeContext,
  useMountedEditorRuntimeOwner,
  useOptionalPliteRuntimeContext,
} from '../hooks/use-plite-runtime';
import { useRuntimeFocusState } from '../hooks/use-runtime-focus-state';
import type { ReactRuntimeEditor } from '../plugin/react-editor';
import type {
  EditorContextValue,
  Editor as ReactEditorType,
} from '../plugin/with-react';
import { toPublicRootOption } from '../root-key';
import { setPliteViewSelectionStoreKey } from '../view-selection';
import { createPliteViewSelectionDecorationSource } from '../view-selection-decoration';

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
  const cell = useRef(callbacks);

  useInsertionEffect(() => {
    cell.current = callbacks;
  }, [callbacks, cell]);

  return cell;
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
  /** Editor runtime owned for this provider's mounted lifetime. */
  editor?: ReactEditorType<V, TExtensions>;
  children: React.ReactNode;
  decorations?: ReadonlyArray<
    PliteDecorationSource<ReactEditorType<V, TExtensions>>
  > | null;
  onCommit?: (context: PliteCommitContext<V, TExtensions>) => void;
  onSelectionChange?: (
    context: PliteSelectionChangeContext<V, TExtensions>
  ) => void;
  onValueChange?: (context: PliteValueChangeContext<V, TExtensions>) => void;
  readOnly?: boolean;
  /** Named root view within the mounted editor runtime. */
  root?: NamedRootKey<TRoot>;
};

/**
 * Provide one mounted editor runtime to React descendants.
 *
 * Remount this provider with a different React key before replacing its editor
 * runtime. Named root views may change within the same runtime.
 */

export const Plite = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly unknown[],
  const TRoot extends RootKey = RootKey,
>(
  props: PliteProps<V, TExtensions, TRoot>
) => {
  const runtimeContext = useOptionalPliteRuntimeContext();

  useMountedEditorRuntimeOwner(
    'Plite',
    props.editor ?? runtimeContext?.runtime.editor
  );

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

    return <PliteRuntimeView {...props} />;
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
      />
    );
  }

  return <PliteSingleEditor {...props} editor={props.editor} />;
};

const PliteRuntimeView = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly unknown[],
>({
  children,
  decorations = null,
  onCommit,
  onSelectionChange,
  onValueChange,
  readOnly = false,
  root,
  directEditor,
}: PliteProps<V, TExtensions> & {
  directEditor?: ReactEditorType<V, TExtensions>;
}) => {
  const runtimeContext = useRequiredPliteRuntimeContext();
  const { getView, registerViewEditor } = runtimeContext;
  const editor = useMemo(() => {
    if (directEditor) {
      return directEditor as unknown as NonNullable<
        ReturnType<typeof runtimeContext.getMountedViewEditor>
      >;
    }

    const view = getView({
      readOnly: true,
      root,
    });

    const viewEditor = createReactRuntimeViewEditor(view);

    setPliteViewSelectionStoreKey(viewEditor, runtimeContext.runtime.editor);

    return viewEditor;
  }, [directEditor, getView, root, runtimeContext.runtime.editor]);
  const reactEditor = editor;
  useInsertionEffect(() => {
    if (directEditor) return undefined;
    setEditorReadOnly(reactEditor, readOnly);
    return () => setEditorReadOnly(reactEditor, true);
  }, [directEditor, reactEditor, readOnly]);
  const viewRoot = toInternalRoot(editor.read((state) => state.view.root()));
  const contentRootOwner = useContext(PliteContentRootOwnerContext);
  const { focused: isFocused } = useRuntimeFocusState(reactEditor);
  useIsomorphicLayoutEffect(
    () => registerViewEditor(reactEditor, viewRoot),
    [reactEditor, registerViewEditor, viewRoot]
  );
  usePliteChangeCallbacks({
    enabled: !directEditor,
    editor: reactEditor,
    onCommit,
    onSelectionChange,
    onValueChange,
    root: viewRoot,
  });
  const viewSelectionDecoration = useMemo(
    () =>
      createPliteViewSelectionDecorationSource(reactEditor, contentRootOwner),
    [contentRootOwner, reactEditor]
  );
  const allDecorations = useMemo(
    () => [
      ...(decorations ?? []),
      viewSelectionDecoration as unknown as PliteDecorationSource<
        ReactEditorType<V, TExtensions>
      >,
    ],
    [decorations, viewSelectionDecoration]
  );
  const decorationManager = usePliteDecorationManager(
    reactEditor as unknown as ReactEditorType<V, TExtensions>,
    allDecorations
  );
  const registerDecorationSource = useDecorationRegistrar(decorationManager);
  return (
    <EditorSelectorContext value={runtimeContext.selectorContext}>
      <DecorationContext value={decorationManager}>
        <DecorationRegistrationContext value={registerDecorationSource}>
          <EditorContext
            value={reactEditor as unknown as EditorContextValue<any>}
          >
            <ReadOnlyContext value={readOnly}>
              <FocusedContext value={isFocused}>{children}</FocusedContext>
            </ReadOnlyContext>
          </EditorContext>
        </DecorationRegistrationContext>
      </DecorationContext>
    </EditorSelectorContext>
  );
};

const usePliteChangeCallbacks = <
  V extends Value,
  TExtensions extends readonly unknown[],
  TRuntimeExtensions extends readonly unknown[],
>({
  enabled,
  editor,
  onCommit,
  onSelectionChange,
  onValueChange,
  root,
}: {
  enabled: boolean;
  editor: ReactRuntimeEditor<V, TRuntimeExtensions>;
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
  const [lastSnapshotRef] = useState(() => ({
    current: editorGetSnapshot(editor),
  }));
  const [commitPublicationQueue] = useState(() =>
    createEditorCommitPublicationQueue<V>(editorBaseline.commitVersion)
  );

  useIsomorphicLayoutEffect(() => {
    if (!enabled) return undefined;

    lastSnapshotRef.current = editorBaseline.snapshot;
    resetEditorCommitPublicationQueue(
      commitPublicationQueue,
      editorBaseline.commitVersion
    );

    const publishContextChange = (
      commit: EditorCommit,
      snapshot: EditorSnapshot<V>
    ) => {
      const previousSnapshot = lastSnapshotRef.current;
      const valueChanged =
        isRootValueChanged(root, commit) &&
        previousSnapshot.children !== snapshot.children;
      const selectionChanged =
        commit.selectionChanged &&
        !SelectionApi.equals(previousSnapshot.selection, snapshot.selection);
      lastSnapshotRef.current = snapshot;

      const context = {
        commit,
        editor,
        snapshot,
      } as unknown as PliteCommitContext<V, TExtensions>;
      const {
        onCommit: innerOnCommit,
        onSelectionChange: innerOnSelectionChange,
        onValueChange: innerOnValueChange,
      } = changeCallbacksCell.current;

      innerOnCommit?.(context);

      if (valueChanged) {
        innerOnValueChange?.({
          ...context,
          value: snapshot.children,
        });
      }

      if (selectionChanged) {
        innerOnSelectionChange?.({
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
    enabled,
    editor,
    editorBaseline,
    root,
  ]);
};

const PliteSingleEditor = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly unknown[],
>({
  editor,
  onCommit,
  onSelectionChange,
  onValueChange,
  ...props
}: PliteProps<V, TExtensions> & {
  editor: ReactEditorType<V, TExtensions>;
}) => {
  // oxlint-disable-next-line typescript/no-unnecessary-type-assertion -- [P0 typecheck-boundary] Widening before the guard avoids recursively comparing the extension graph.
  if (!isEditor(editor as unknown)) {
    throw new Error('[Plite] editor is invalid!');
  }

  const runtime = useMemo(
    () =>
      Object.freeze({
        api: editor.api,
        anchor: editor.anchor,
        editor,
        extension: editor.extension,
        install: editor.install,
        read: editor.read,
        subscribe: editor.subscribe,
        subscribeCommit: editor.subscribeCommit,
        update: editor.update,
      }) as PliteRuntimeValue<V, TExtensions>,
    [editor]
  );
  const changeCallbacks = useMemo(
    () => ({ onCommit, onSelectionChange, onValueChange }),
    [onCommit, onSelectionChange, onValueChange]
  );
  const changeCallbacksCell = useRef(changeCallbacks);

  useInsertionEffect(() => {
    changeCallbacksCell.current = changeCallbacks;
  }, [changeCallbacks]);

  const observeCommit = useCallback(
    (commit: EditorCommit, snapshot: EditorSnapshot<V>) => {
      const callbacks = changeCallbacksCell.current;
      const context = {
        commit,
        editor,
        snapshot,
      } as unknown as PliteCommitContext<V, TExtensions>;

      callbacks.onCommit?.(context);
      if (isRootValueChanged('main', commit)) {
        callbacks.onValueChange?.({ ...context, value: snapshot.children });
      }
      if (isRootSelectionChanged('main', commit)) {
        callbacks.onSelectionChange?.({
          ...context,
          selection: snapshot.selection,
        });
      }
    },
    [changeCallbacksCell, editor]
  );

  return (
    <PliteRuntimeProvider runtime={runtime} onCommit={observeCommit}>
      <PliteRuntimeView {...props} directEditor={editor} />
    </PliteRuntimeProvider>
  );
};

const usePliteDecorationManager = <E,>(
  editor: E,
  sources: ReadonlyArray<PliteDecorationSource<E>> | null
) => {
  const manager = useMemo(
    () => createPliteDecorationManager(editor, sources ?? []),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- Sources reconcile through setSources; manager lifetime follows only the editor runtime.
    [editor]
  );
  const lifecycleVersionRef = useRef(0);
  const currentManagerRef = useRef(manager);

  useIsomorphicLayoutEffect(() => {
    manager.setSources(sources ?? []);
  }, [manager, sources]);
  useInsertionEffect(() => {
    currentManagerRef.current = manager;
    lifecycleVersionRef.current += 1;
    const lifecycleVersion = lifecycleVersionRef.current;
    const unmount = manager.mount();

    return () => {
      unmount();
      queueMicrotask(() => {
        if (
          currentManagerRef.current !== manager ||
          lifecycleVersionRef.current === lifecycleVersion
        ) {
          manager.destroy();
        }
      });
    };
  }, [manager]);

  return manager;
};

const useDecorationRegistrar = <E,>(
  manager: ReturnType<typeof createPliteDecorationManager<E>>
) =>
  useCallback<PliteDecorationRegistrar>(
    (source) => manager.registerSource(source),
    [manager]
  );
