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
  type EditorViewOptions,
  type EditorSnapshot,
  isEditor,
  type NamedRootKey,
  type RootKey,
  type Selection,
  SelectionApi,
  type Value,
  type ValueOf,
} from '../..';
import {
  configureAuthoredView,
  readAuthoredView,
} from '../../core/authored-runtime';
import {
  createEditorCommitPublicationQueue,
  resetEditorCommitPublicationQueue,
  publishEditorCommitInVersionOrder,
} from '../../core/commit-publication';
import { startOwnedEditor } from '../../core/editor-owner';
import { PliteContentRootOwnerContext } from '../context';
import {
  DecorationContext,
  DecorationRegistrationContext,
  DecorationSourcesContext,
  type PliteDecorationRegistrar,
} from '../decoration-context';
import {
  createPliteDecorationManager,
  type DecorationSource,
} from '../decoration-source';
import {
  getEditorRuntime,
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
} from '../hooks/use-plite-node-ref';
import {
  createReactRuntimeViewEditor,
  EditorRuntimeProvider,
  useRequiredPliteRuntimeContext,
  useOptionalPliteRuntimeContext,
} from '../hooks/use-plite-runtime';
import { useRuntimeFocusState } from '../hooks/use-runtime-focus-state';
import type {
  EditorContextValue,
  Editor as ReactEditorType,
} from '../plugin/with-react';
import { profilePliteReactDuration } from '../render-profiler';
import { toPublicRootOption } from '../root-key';
import {
  mountPliteViewSelection,
  setPliteViewSelectionStoreKey,
} from '../view-selection';
import {
  createPliteViewSelectionDecorationSource,
  usePliteViewSelectionPresence,
} from '../view-selection-decoration';
import { ImperativeTextFlowContext } from './editable-text-flow';

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

type EditorRuntimeViewProps<E extends ReactEditorType<any, any>> = {
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
  root?: NamedRootKey;
};

const RUNTIME_KEYS = new WeakMap<object, string>();
let nextRuntimeKey = 0;

const getRuntimeKey = (editor: unknown) => {
  if (!isEditor(editor)) return undefined;

  const owner = getEditorRuntimeOwner(editor);
  let key = RUNTIME_KEYS.get(owner);

  if (key === undefined) {
    key = `runtime-${(nextRuntimeKey += 1)}`;
    RUNTIME_KEYS.set(owner, key);
  }

  return key;
};

/**
 * Provide one mounted editor runtime to React descendants. Passing an editor
 * with another runtime remounts everything below. Named root views may change
 * within the same runtime.
 */
export const EditorRoot = <
  E extends ReactEditorType<any, any>,
  const TRoot extends RootKey = RootKey,
>(
  props: EditorRootProps<E, TRoot>
) => <EditorRootContent key={getRuntimeKey(props.editor)} {...props} />;

const EditorRootContent = <
  E extends ReactEditorType<any, any>,
  const TRoot extends RootKey = RootKey,
>(
  props: EditorRootProps<E, TRoot>
) => {
  const runtimeContext = useOptionalPliteRuntimeContext();
  const { editor, ...viewProps } = props;

  if (props.root === 'main') {
    throw new Error('Omit root to render the primary document.');
  }

  // oxlint-disable-next-line typescript/no-unnecessary-type-assertion -- [P0 typecheck-boundary] Widening before the guard avoids recursively comparing the plugin graph.
  if (!isEditor(editor as unknown)) {
    throw new Error('editor is invalid!');
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
    <EditorRuntimeView
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
    <EditorRuntimeProvider editor={owner as E}>{content}</EditorRuntimeProvider>
  );
};

export const EditorRuntimeView = <
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
}: EditorRuntimeViewProps<E>) => {
  const runtimeContext = useRequiredPliteRuntimeContext();
  const { getView, registerViewEditor } = runtimeContext;
  const parentEditor = useOptionalEditorContext();
  const inheritedTextFlow = useContext(ImperativeTextFlowContext);
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
    () => mountPliteViewSelection(reactEditor),
    [reactEditor]
  );
  useIsomorphicLayoutEffect(() => {
    if (authored) configureAuthoredView(reactEditor, authored);
    // Equivalent inline props must preserve a mode changed by view commands.
  }, [
    authored && ('intent' in authored ? authored.intent : authored.preview),
    reactEditor,
  ]);
  useInsertionEffect(() => {
    if (directEditor) return undefined;
    setEditorReadOnly(reactEditor, readOnly);
    return () => setEditorReadOnly(reactEditor, true);
  }, [directEditor, reactEditor, readOnly]);
  const viewRoot = toInternalRoot(editor.read((state) => state.view.root()));
  const { focused: isFocused } = useRuntimeFocusState(reactEditor);
  useIsomorphicLayoutEffect(
    () => registerViewEditor(reactEditor, viewRoot),
    [reactEditor, registerViewEditor, viewRoot]
  );
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
      <FirstChildViewStart
        editor={reactEditor}
        onChange={onChange}
        onCommit={onCommit}
        onSelectionChange={onSelectionChange}
        onValueChange={onValueChange}
        root={viewRoot}
      />
      <DecorationContext value={decorationManager}>
        <DecorationRegistrationContext value={registerDecorationSource}>
          <DecorationSourcesContext
            value={
              decorations as ReadonlyArray<DecorationSource<unknown>> | null
            }
          >
            <EditorContext
              value={reactEditor as unknown as EditorContextValue<any>}
            >
              <ReadOnlyContext value={readOnly}>
                <FocusedContext value={isFocused}>
                  {/* A nested editor renders its text as it would at the top level, even inside a paged view. */}
                  <ImperativeTextFlowContext
                    value={parentEditor ? true : inheritedTextFlow}
                  >
                    {children}
                  </ImperativeTextFlowContext>
                </FocusedContext>
              </ReadOnlyContext>
            </EditorContext>
          </DecorationSourcesContext>
        </DecorationRegistrationContext>
      </DecorationContext>
    </EditorSelectorContext>
  );
};

type ChangeCallbacksInput<E extends ReactEditorType<any, any>> = {
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
};

const FirstChildViewStart = <E extends ReactEditorType<any, any>>(
  props: ChangeCallbacksInput<E>
) => {
  usePliteChangeCallbacks(props);
  useIsomorphicLayoutEffect(() => {
    startOwnedEditor(props.editor);
  }, [props.editor]);

  return null;
};

const usePliteChangeCallbacks = <E extends ReactEditorType<any, any>>({
  editor,
  onChange,
  onCommit,
  onSelectionChange,
  onValueChange,
  root,
}: ChangeCallbacksInput<E>) => {
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
  const [queueBaselineRef] = useState<{
    current: typeof editorBaseline | null;
  }>(() => ({ current: null }));

  useIsomorphicLayoutEffect(() => {
    // Strict Mode and Activity reconnect this effect; a commit it already
    // delivered must not be delivered again.
    if (queueBaselineRef.current !== editorBaseline) {
      queueBaselineRef.current = editorBaseline;
      lastSnapshotRef.current = editorBaseline.snapshot;
      resetEditorCommitPublicationQueue(
        commitPublicationQueue,
        editorBaseline.commitVersion
      );
    }

    const publishContextChange = (
      commit: EditorCommit,
      snapshot: EditorSnapshot<ValueOf<E>>
    ) => {
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
    const unsubscribe = getEditorRuntime(editor).subscribe((snapshot, commit) =>
      publishEditorCommitInVersionOrder(
        commitPublicationQueue,
        commit,
        snapshot,
        publishContextChange,
        { allowVersionGap: false }
      )
    );
    const unsubscribeView = subscribeEditorViewState(editor, (change) => {
      if (change !== 'authored') return;
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
