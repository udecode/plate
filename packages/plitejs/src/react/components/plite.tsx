import React, {
  useCallback,
  useContext,
  useInsertionEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  type Descendant,
  type EditorCommit,
  type EditorCommitContext,
  type EditorViewOptions,
  type EditorSnapshot,
  type PluginsOf,
  isEditor,
  type NamedRootKey,
  type RootKey,
  type Selection,
  SelectionApi,
  type Text as TextNode,
  type Value,
  type Path,
  type NodeKey,
  NodeApi,
  type ValueOf,
} from '../..';
import { readAuthoredFragmentRoots } from '../../core/authored-fragment-view';
import {
  configureAuthoredView,
  readAuthoredView,
  readAuthoredFragmentView,
  readAuthoredViewFragments,
  type NativeAuthoredFragment,
} from '../../core/authored-runtime';
import {
  createEditorCommitPublicationQueue,
  resetEditorCommitPublicationQueue,
  publishEditorCommitInVersionOrder,
} from '../../core/commit-publication';
import { getDefined } from '../../internal/get-defined';
import { AuthoredFragmentRootsContext } from '../authored-fragment-context';
import { ElementContext, PliteContentRootOwnerContext } from '../context';
import {
  DecorationContext,
  DecorationRegistrationContext,
  type PliteDecorationRegistrar,
} from '../decoration-context';
import {
  createPliteDecorationManager,
  type DecorationSource,
} from '../decoration-source';
import {
  getEditorRuntimeOwner,
  getLastCommit as editorGetLastCommit,
  getSnapshot as editorGetSnapshot,
  setEditorReadOnly,
  subscribeEditorViewState,
  toInternalRoot,
} from '../editable/runtime-editor-api';
import { getSchemaInvalidatedNodeKeys } from '../editable/schema-runtime-invalidation';
import {
  EditorContext,
  useEditorContext,
  useOptionalEditorContext,
} from '../hooks/use-editor-context';
import { FocusedContext } from '../hooks/use-editor-focused';
import { ReadOnlyContext } from '../hooks/use-editor-read-only';
import {
  EditorSelectorContext,
  useEditorSelectorContext,
} from '../hooks/use-editor-selector';
import { useIsomorphicLayoutEffect } from '../hooks/use-isomorphic-layout-effect';
import {
  syncChangedTextToDOM,
  syncPliteNodePathBindingsToDOM,
  usePliteLazyFragmentNodeRef,
} from '../hooks/use-plite-node-ref';
import {
  createReactRuntimeViewEditor,
  PliteRuntimeProvider,
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
import { profilePliteReactDuration } from '../render-profiler';
import { toPublicRootOption } from '../root-key';
import {
  mountPliteViewSelection,
  reconcilePliteViewSelection,
  setPliteViewSelectionStoreKey,
} from '../view-selection';
import {
  createPliteViewSelectionDecorationSource,
  usePliteViewSelectionPresence,
} from '../view-selection-decoration';

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

type PliteChangeCallbacks<E extends ReactEditorType<any, any>> = {
  onCommit?: (context: EditorCommitContext<E>) => void;
  onSelectionChange?: (
    context: EditorCommitContext<E> & {
      selection: EditorCommitContext<E>['snapshot']['selection'];
    }
  ) => void;
  onValueChange?: (
    context: EditorCommitContext<E> & { value: ValueOf<E> }
  ) => void;
};

const useCommittedChangeCallbackCell = <E extends ReactEditorType<any, any>>(
  callbacks: PliteChangeCallbacks<E>
) => {
  const cell = useRef(callbacks);

  useInsertionEffect(() => {
    cell.current = callbacks;
  }, [callbacks, cell]);

  return cell;
};

/** Canonical commit payload observed by a Plite React provider. */
export type CommitContext<
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly unknown[],
> = EditorCommitContext<ReactEditorType<V, TPlugins>>;

/** Value-change payload derived independently from a canonical commit. */
export type ValueChangeContext<
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly unknown[],
> = CommitContext<V, TPlugins> & {
  value: V;
};

/** Selection-change payload derived independently from a canonical commit. */
export type SelectionChangeContext<
  V extends Value = Value,
  TPlugins extends readonly unknown[] = readonly unknown[],
> = CommitContext<V, TPlugins> & {
  selection: EditorSnapshot<V>['selection'];
};

/** Props for the Plite React provider around editable roots and callbacks. */
export type EditorRootProps<
  E extends ReactEditorType<any, any> = ReactEditorType<any, any>,
  TRoot extends RootKey = RootKey,
> = EditorViewOptions<TRoot> &
  (NoInfer<E> extends { read: { authored: unknown } }
    ? unknown
    : { authored?: never }) & {
    /** Document and initial view policy for this mounted lifetime. */
    editor: E;
    children: React.ReactNode;
    decorations?: ReadonlyArray<DecorationSource<NoInfer<E>>> | null;
    onCommit?: (context: EditorCommitContext<NoInfer<E>>) => void;
    onSelectionChange?: (
      context: EditorCommitContext<NoInfer<E>> & {
        selection: EditorCommitContext<NoInfer<E>>['snapshot']['selection'];
      }
    ) => void;
    onValueChange?: (
      context: EditorCommitContext<NoInfer<E>> & { value: ValueOf<E> }
    ) => void;
  };

type PliteRuntimeViewProps<E extends ReactEditorType<any, any>> = {
  authored?: EditorViewOptions['authored'];
  children: React.ReactNode;
  decorations?: ReadonlyArray<DecorationSource<E>> | null;
  directEditor?: E;
  lifetime?: object;
  onCommit?: (context: EditorCommitContext<E>) => void;
  onSelectionChange?: (
    context: EditorCommitContext<E> & {
      selection: EditorCommitContext<E>['snapshot']['selection'];
    }
  ) => void;
  onValueChange?: (
    context: EditorCommitContext<E> & { value: ValueOf<E> }
  ) => void;
  readOnly?: boolean;
  retained?: boolean;
  root?: NamedRootKey;
};

/**
 * Provide one mounted editor runtime to React descendants.
 *
 * Remount this provider with a different React key before replacing its editor
 * runtime. Named root views may change within the same runtime.
 */

export const EditorRoot = <
  E extends ReactEditorType<any, any>,
  const TRoot extends RootKey = RootKey,
>(
  props: EditorRootProps<E, TRoot>
) => {
  const runtimeContext = useOptionalPliteRuntimeContext();
  const { editor, ...viewProps } = props;

  useMountedEditorRuntimeOwner('EditorRoot', editor);

  if (props.root === 'main') {
    throw new Error('[Plite] Omit root to render the primary document.');
  }

  // oxlint-disable-next-line typescript/no-unnecessary-type-assertion -- [P0 typecheck-boundary] Widening before the guard avoids recursively comparing the plugin graph.
  if (!isEditor(editor as unknown)) {
    throw new Error('[Plite] editor is invalid!');
  }

  const owner = getEditorRuntimeOwner(editor);
  const defaults = useMemo(() => {
    const initialRoot = editor.read((state) => state.view.root());

    return {
      authored: readAuthoredView(editor),
      readOnly: editor.read((state) => state.view.isReadOnly()),
      root: initialRoot === 'main' ? undefined : initialRoot,
    };
  }, [editor]);
  const content = (
    <PliteRuntimeView
      {...viewProps}
      authored={props.authored ?? defaults.authored}
      lifetime={editor}
      readOnly={props.readOnly ?? defaults.readOnly}
      root={props.root ?? defaults.root}
    />
  );

  return runtimeContext &&
    getEditorRuntimeOwner(runtimeContext.runtime) === owner ? (
    content
  ) : (
    <PliteRuntimeProvider editor={owner as E}>{content}</PliteRuntimeProvider>
  );
};

export const PliteRuntimeView = <
  E extends ReactEditorType<any, any> = ReactEditorType<any, any>,
>({
  authored,
  children,
  decorations = null,
  onCommit,
  onSelectionChange,
  onValueChange,
  readOnly = false,
  root,
  directEditor,
  lifetime,
  retained = false,
}: PliteRuntimeViewProps<E>) => {
  const runtimeContext = useRequiredPliteRuntimeContext();
  const { getView, registerViewEditor } = runtimeContext;
  const parentEditor = useOptionalEditorContext();
  const contentRootOwner = useContext(PliteContentRootOwnerContext);
  const selectionOwner = root ? parentEditor : null;
  const { selectorContext, onChange } = useEditorSelectorContext();
  const editor = useMemo(() => {
    if (directEditor) {
      return directEditor;
    }

    const view = getView({
      authored,
      readOnly,
      root,
    });

    const viewEditor = createReactRuntimeViewEditor(view);

    if (selectionOwner) {
      setPliteViewSelectionStoreKey(viewEditor, selectionOwner);
    }

    return viewEditor as unknown as E;
    // Authored and read-only policy updates reconcile below without replacing
    // the view. Their current values seed only a new input/root lifetime.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [directEditor, getView, lifetime, root, selectionOwner]);
  const reactEditor = editor;
  useIsomorphicLayoutEffect(
    () => (retained ? undefined : mountPliteViewSelection(reactEditor)),
    [reactEditor, retained]
  );
  useIsomorphicLayoutEffect(() => {
    if (authored) configureAuthoredView(reactEditor, authored);
    // Equivalent inline props must preserve a mode changed by view commands.
  }, [authored?.intent, authored?.projection, reactEditor]);
  useInsertionEffect(() => {
    if (directEditor) return undefined;
    setEditorReadOnly(reactEditor, readOnly);
    return () => setEditorReadOnly(reactEditor, true);
  }, [directEditor, reactEditor, readOnly]);
  const viewRoot = toInternalRoot(editor.read((state) => state.view.root()));
  const { focused: isFocused } = useRuntimeFocusState(reactEditor);
  useIsomorphicLayoutEffect(
    () => (retained ? undefined : registerViewEditor(reactEditor, viewRoot)),
    [reactEditor, registerViewEditor, retained, viewRoot]
  );
  usePliteChangeCallbacks({
    editor: reactEditor,
    onChange,
    onCommit,
    onSelectionChange,
    onValueChange,
    root: viewRoot,
  });
  const hasViewSelection = usePliteViewSelectionPresence(reactEditor);
  const viewSelectionDecoration = useMemo(
    () =>
      createPliteViewSelectionDecorationSource(reactEditor, contentRootOwner),
    [contentRootOwner, reactEditor]
  );
  const allDecorations = useMemo(
    () =>
      hasViewSelection
        ? [
            ...(decorations ?? []),
            viewSelectionDecoration as unknown as DecorationSource<E>,
          ]
        : (decorations ?? []),
    [decorations, hasViewSelection, viewSelectionDecoration]
  );
  const decorationManager = usePliteDecorationManager(
    reactEditor,
    allDecorations
  );
  const registerDecorationSource = useDecorationRegistrar(decorationManager);
  return (
    <EditorSelectorContext value={selectorContext}>
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

/** Mount native retained coordinates without registering another editable root. */
export const usePliteRenderContext = () => {
  const selector = useContext(EditorSelectorContext);
  const decorations = useContext(DecorationContext);
  const registerDecoration = useContext(DecorationRegistrationContext);
  const editor = useContext(EditorContext);
  const readOnly = useContext(ReadOnlyContext);
  const focused = useContext(FocusedContext);
  const fragment = useContext(AuthoredFragmentRootsContext);
  return useCallback(
    (children: React.ReactNode) => (
      <EditorSelectorContext value={selector}>
        <DecorationContext value={decorations}>
          <DecorationRegistrationContext value={registerDecoration}>
            <EditorContext value={editor}>
              <ReadOnlyContext value={readOnly}>
                <FocusedContext value={focused}>
                  <AuthoredFragmentRootsContext value={fragment}>
                    {children}
                  </AuthoredFragmentRootsContext>
                </FocusedContext>
              </ReadOnlyContext>
            </EditorContext>
          </DecorationRegistrationContext>
        </DecorationContext>
      </EditorSelectorContext>
    ),
    [
      selector,
      decorations,
      registerDecoration,
      editor,
      readOnly,
      focused,
      fragment,
    ]
  );
};

type PliteFragmentProps = {
  children: (nodeKeys: readonly NodeKey[]) => React.ReactNode;
  fragment: NativeAuthoredFragment;
  paths?: readonly Path[];
  readOnlyRoots?: boolean;
};

const usePliteFragmentMount = (fragment: NativeAuthoredFragment) => {
  const parent = useEditorContext();
  const { getAuthoredFragmentView, mountAuthoredFragmentView } =
    useRequiredPliteRuntimeContext();
  const { changeId, id, root } = fragment;
  const sharedView = useMemo(
    () =>
      getAuthoredFragmentView(
        parent,
        getDefined(
          readAuthoredViewFragments(parent, changeId).find(
            (current) => current.id === id && current.root === root
          )
        )
      ),
    [changeId, getAuthoredFragmentView, id, parent, root]
  );
  const editor = useMemo(() => {
    const view = createReactRuntimeViewEditor(sharedView, sharedView);

    setPliteViewSelectionStoreKey(view, parent);
    return view as unknown as EditorContextValue<any>;
  }, [parent, sharedView]);
  useIsomorphicLayoutEffect(
    () => mountAuthoredFragmentView(sharedView),
    [mountAuthoredFragmentView, sharedView]
  );

  return { editor, parent };
};

const usePliteFragmentEditor = (fragment: NativeAuthoredFragment) => {
  const fragmentMount = usePliteFragmentMount(fragment);
  const { editor } = fragmentMount;
  const value = React.useSyncExternalStore(
    useCallback((notify) => editor.subscribeCommit(() => notify()), [editor]),
    useCallback(() => editor.read.children(), [editor]),
    useCallback(() => editor.read.children(), [editor])
  );

  return { ...fragmentMount, value };
};

const PliteFragmentView = ({
  children,
  editor,
  fragment,
  parent,
  paths,
  readOnlyRoots = true,
  value,
}: PliteFragmentProps & {
  editor: EditorContextValue<any>;
  parent: EditorContextValue<any>;
  value: readonly Descendant[];
}) => {
  const keys = (
    paths ?? readAuthoredFragmentRoots(fragment, value).map(([, path]) => path)
  ).flatMap((path) => {
    const first = path.length ? value[path[0]] : undefined;
    const node = first ? NodeApi.getIf(first, path.slice(1)) : undefined;
    const key = node && NodeApi.isDescendant(node) ? editor.key(node) : null;
    return key ? [key] : [];
  });
  const roots = new Map(keys.map((key) => [key, readOnlyRoots]));
  return (
    <AuthoredFragmentRootsContext value={{ parent, roots }}>
      <ElementContext value={null}>
        <PliteRuntimeView directEditor={editor} readOnly retained>
          {children(keys)}
        </PliteRuntimeView>
      </ElementContext>
    </AuthoredFragmentRootsContext>
  );
};

export const PliteFragment = (props: PliteFragmentProps) => {
  const fragmentView = usePliteFragmentEditor(props.fragment);

  return <PliteFragmentView {...props} {...fragmentView} />;
};

const PliteLazyPlainRetainedText = ({
  fragment,
  node,
  parent,
  path,
  readOnly,
}: {
  fragment: NativeAuthoredFragment;
  node: TextNode;
  parent: EditorContextValue<any>;
  path: Path;
  readOnly: boolean;
}) => {
  const { getAuthoredFragmentView, mountAuthoredFragmentView } =
    useRequiredPliteRuntimeContext();
  const { changeId, id, root } = fragment;
  const materialize = useCallback(() => {
    const current = getDefined(
      readAuthoredViewFragments(parent, changeId).find(
        (candidate) => candidate.id === id && candidate.root === root
      )
    );
    const sharedView = getAuthoredFragmentView(parent, current);
    const release = mountAuthoredFragmentView(sharedView);

    try {
      const editor = createReactRuntimeViewEditor(sharedView, sharedView);
      const [pliteNode, livePath] = getDefined(
        readAuthoredFragmentRoots(current, editor.read.children())[0]
      );
      const nodeKey = getDefined(editor.key(pliteNode));

      setPliteViewSelectionStoreKey(editor, parent);
      return { editor, nodeKey, path: livePath, pliteNode, release };
    } catch (error) {
      release();
      throw error;
    }
  }, [
    changeId,
    getAuthoredFragmentView,
    id,
    mountAuthoredFragmentView,
    parent,
    root,
  ]);
  const ref = usePliteLazyFragmentNodeRef(parent, fragment, materialize, {
    readOnly,
  });

  return (
    <span
      data-editor-dom-sync
      data-editor-node="text"
      data-editor-path={path.join(',')}
      ref={ref}
    >
      <span data-editor-leaf data-editor-string>
        {node.text}
      </span>
    </span>
  );
};

export const PlitePlainTextFragment = (
  props: PliteFragmentProps & { hasViewSelection: boolean }
) => {
  const parent = useEditorContext();
  const entries = readAuthoredFragmentRoots(props.fragment);
  const [node, path] = entries[0] ?? [];
  const plain =
    entries.length === 1 &&
    node &&
    NodeApi.isText(node) &&
    Object.keys(node).length === 1 &&
    node.text.length > 0 &&
    !node.text.endsWith('\n');

  if (!plain || props.hasViewSelection) {
    return <PliteFragment {...props} />;
  }

  return (
    <PliteLazyPlainRetainedText
      fragment={props.fragment}
      node={node}
      parent={parent}
      path={path}
      readOnly={props.readOnlyRoots ?? true}
    />
  );
};

const usePliteChangeCallbacks = <E extends ReactEditorType<any, any>>({
  editor,
  onChange,
  onCommit,
  onSelectionChange,
  onValueChange,
  root,
}: {
  editor: E;
  onChange: ReturnType<typeof useEditorSelectorContext>['onChange'];
  onCommit?: (context: EditorCommitContext<E>) => void;
  onSelectionChange?: (
    context: EditorCommitContext<E> & {
      selection: EditorCommitContext<E>['snapshot']['selection'];
    }
  ) => void;
  onValueChange?: (
    context: EditorCommitContext<E> & { value: ValueOf<E> }
  ) => void;
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
    createEditorCommitPublicationQueue<ValueOf<E>>(editorBaseline.commitVersion)
  );

  useIsomorphicLayoutEffect(() => {
    lastSnapshotRef.current = editorBaseline.snapshot;
    resetEditorCommitPublicationQueue(
      commitPublicationQueue,
      editorBaseline.commitVersion
    );

    const publishContextChange = (
      commit: EditorCommit,
      snapshot: EditorSnapshot<ValueOf<E>>
    ) => {
      reconcilePliteViewSelection(editor);
      const textSync = profilePliteReactDuration('dom-text-sync', () =>
        syncChangedTextToDOM(
          editor,
          commit.changed.nodeKeys('text', toPublicRootOption(root))
        )
      );
      if (commit.changed.has('structure', toPublicRootOption(root))) {
        syncPliteNodePathBindingsToDOM(editor, commit.changed);
      }
      onChange(textSync.requiresGlobalRender ? undefined : commit, [
        ...getSchemaInvalidatedNodeKeys(editor, commit),
        ...textSync.invalidatedNodeKeys,
      ]);
      const previousSnapshot = lastSnapshotRef.current;
      const valueChanged =
        isRootValueChanged(root, commit) &&
        previousSnapshot.children !== snapshot.children;
      const selectionChanged =
        isRootSelectionChanged(root, commit) &&
        !SelectionApi.equals(previousSnapshot.selection, snapshot.selection);
      lastSnapshotRef.current = snapshot;

      const context = {
        commit,
        editor,
        snapshot,
      } as EditorCommitContext<E>;
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
      ReactRuntimeEditor<ValueOf<E>, PluginsOf<E>>['subscribeCommit']
    >[0] = (commit, snapshot) => {
      publishEditorCommitInVersionOrder(
        commitPublicationQueue,
        commit,
        snapshot,
        publishContextChange,
        { allowVersionGap: readAuthoredFragmentView(editor) !== null }
      );
    };

    const unsubscribe = editor.subscribe((snapshot, commit) => {
      if (commit) onContextChange(commit, snapshot);
      else {
        lastSnapshotRef.current = snapshot;
        onChange();
      }
    });
    const unsubscribeView = subscribeEditorViewState(editor, (change) => {
      if (change !== 'authored') return;
      reconcilePliteViewSelection(editor);
      const snapshot = editorGetSnapshot(editor);
      if (snapshot.children !== lastSnapshotRef.current.children) {
        syncChangedTextToDOM(editor, []);
      }
      lastSnapshotRef.current = snapshot;
      onChange();
    });
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

    return () => {
      unsubscribe();
      unsubscribeView();
    };
  }, [
    changeCallbacksCell,
    commitPublicationQueue,
    onChange,
    editor,
    editorBaseline,
    root,
  ]);
};

const usePliteDecorationManager = <E,>(
  editor: E,
  sources: ReadonlyArray<DecorationSource<E>> | null
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
