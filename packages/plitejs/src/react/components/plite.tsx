import React, {
  Component,
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
  type EditorDocumentValue,
  type EditorViewOptions,
  type EditorSnapshot,
  isEditor,
  type NamedRootKey,
  type ReadValue,
  type RootKey,
  type Selection,
  SelectionApi,
  type ValueOf,
} from '../..';
import {
  readAuthoredView,
  requestAuthoredView,
  readShownPreview,
} from '../../core/authored-runtime';
import {
  createEditorCommitPublicationQueue,
  resetEditorCommitPublicationQueue,
  publishEditorCommitInVersionOrder,
} from '../../core/commit-publication';
import { startOwnedEditor } from '../../core/editor-owner';
import { runEditorObserver } from '../../core/lifecycle-error';
import {
  didCommitChangePersistedValue,
  flushEditorViewState,
  getCommitDocumentValue,
} from '../../core/public-state';
import {
  retainPresentation,
  type ViewPresentation,
} from '../../core/view-presentation';
import {
  createViewLockScope,
  flushViewLockScope,
  getCarriedMount,
  getViewAuthor,
  getViewPresentation,
  joinViewLockScope,
  linkViewLockScope,
  setViewLockScopeLocked,
  type ViewLockScope,
  withMountedPresentation,
} from '../../editor-runtime-view';
import type { AnyEditor } from '../../interfaces/editor';
import {
  PliteContentRootInstanceContext,
  PliteContentRootOwnerContext,
  PliteEditingAreaContext,
} from '../context';
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
  subscribeSharedEditorViewState,
  toInternalRoot,
} from '../editable/runtime-editor-api';
import { getSchemaInvalidatedNodeKeys } from '../editable/schema-runtime-invalidation';
import {
  EditorContext,
  useOptionalEditorContext,
} from '../hooks/use-editor-context';
import { FocusedContext } from '../hooks/use-editor-focused';
import {
  ExplicitReadOnlyOverrideContext,
  ReadOnlyContext,
  ViewLockScopeContext,
} from '../hooks/use-editor-read-only';
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
  SurfaceRuntimeScope,
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
import { createContentRootPaneKey } from '../slot-arrival';
import { mountPliteViewSelection } from '../view-selection';
import {
  createPliteViewSelectionDecorationSource,
  usePliteViewSelectionPresence,
} from '../view-selection-decoration';
import { ImperativeTextFlowContext } from './editable-text-flow';
import { TextRenderScopeContext } from './editable-text-pieces';

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
  onCommit?: (context: CommitContext<E>) => void;
  onSelectionChange?: (context: SelectionChangeContext<E>) => void;
  onValueChange?: (context: ValueChangeContext<E>) => void;
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
  E extends ReactEditorType<any, any> = ReactEditorType<any, any>,
> = EditorCommitContext<E>;

/** Value-change payload derived independently from a canonical commit. */
export type ValueChangeContext<
  E extends ReactEditorType<any, any> = ReactEditorType<any, any>,
> = CommitContext<E> & {
  value: EditorDocumentValue<ReadValue<ValueOf<E>>>;
};

/** Selection-change payload derived independently from a canonical commit. */
export type SelectionChangeContext<
  E extends ReactEditorType<any, any> = ReactEditorType<any, any>,
> = CommitContext<E> & {
  selection: EditorCommitContext<E>['snapshot']['selection'];
};

/** Props for the Plite React provider around editable roots and callbacks. */
export type EditorRootProps<
  E extends ReactEditorType<any, any> = ReactEditorType<any, any>,
  TRoot extends RootKey = RootKey,
> = Pick<EditorViewOptions<TRoot>, 'authored' | 'readOnly' | 'root'> &
  (NoInfer<E> extends { read: { authored: unknown } }
    ? unknown
    : { authored?: never }) & {
    /** Document and initial view policy for this mounted lifetime. */
    editor: E;
    children: React.ReactNode;
    decorations?: ReadonlyArray<DecorationSource<NoInfer<E>>> | null;
    onCommit?: (context: CommitContext<NoInfer<E>>) => void;
    onSelectionChange?: (context: SelectionChangeContext<NoInfer<E>>) => void;
    onValueChange?: (context: ValueChangeContext<NoInfer<E>>) => void;
  };

type EditorRuntimeViewProps<E extends ReactEditorType<any, any>> = {
  authored?: EditorViewOptions['authored'];
  authorId?: string;
  children: React.ReactNode;
  decorations?: ReadonlyArray<DecorationSource<E>> | null;
  directEditor?: E;
  lifetime?: object;
  lockLink?: ViewLockScope;
  onCommit?: (context: CommitContext<E>) => void;
  onSelectionChange?: (context: SelectionChangeContext<E>) => void;
  onValueChange?: (context: ValueChangeContext<E>) => void;
  mountedIn?: AnyEditor;
  presentation?: ViewPresentation;
  preserveReadOnlyOverride?: boolean;
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

export const SurfaceRoot = ({
  editor,
  nested = false,
  ...props
}: EditorRootProps & {
  nested?: boolean;
}) => {
  const surfaceEditor = useMemo(
    () => withMountedPresentation(editor, editor, nested),
    [editor, nested]
  );

  return (
    <EditorRootContent
      key={getRuntimeKey(surfaceEditor)}
      {...props}
      editor={surfaceEditor}
      preserveReadOnlyOverride
    />
  );
};

const EditorRootContent = <
  E extends ReactEditorType<any, any>,
  const TRoot extends RootKey = RootKey,
>(
  props: EditorRootProps<E, TRoot> & {
    preserveReadOnlyOverride?: boolean;
  }
) => {
  const runtimeContext = useOptionalPliteRuntimeContext();
  const { editor, preserveReadOnlyOverride = false, ...viewProps } = props;

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
      authorId: getViewAuthor(editor),
      readOnly: editor.read((state) => state.view.isReadOnly()),
      root: initialRoot === 'main' ? undefined : initialRoot,
    };
  }, [editor]);
  const enclosingLock = useContext(ViewLockScopeContext);
  const carried = getCarriedMount(editor);
  const followsEnclosingLock = carried !== undefined && !carried.mountedIn;
  const content = (
    <EditorRuntimeView
      {...viewProps}
      // A carried presentation already holds its editor root's mode.
      authored={carried ? undefined : (props.authored ?? defaults.authored)}
      authorId={defaults.authorId}
      lifetime={editor}
      lockLink={followsEnclosingLock ? enclosingLock : undefined}
      mountedIn={carried?.mountedIn}
      presentation={carried?.presentation}
      preserveReadOnlyOverride={preserveReadOnlyOverride}
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
  authorId,
  children,
  decorations = null,
  onCommit,
  onSelectionChange,
  onValueChange,
  readOnly = false,
  root,
  directEditor,
  lifetime,
  lockLink,
  mountedIn,
  presentation,
  preserveReadOnlyOverride = false,
}: EditorRuntimeViewProps<E>) => {
  const runtimeContext = useRequiredPliteRuntimeContext();
  const {
    getView,
    registerHistoryStepView,
    registerViewEditor,
    updateViewInstance,
  } = runtimeContext;
  const parentEditor = useOptionalEditorContext();
  const inheritedExplicitReadOnly = useContext(ExplicitReadOnlyOverrideContext);
  const inheritedTextFlow = useContext(ImperativeTextFlowContext);
  const contentRootOwner = useContext(PliteContentRootOwnerContext);
  const contentRootInstance = useContext(PliteContentRootInstanceContext);
  const [paneKey] = useState(createContentRootPaneKey);
  const { selectorContext, onChange } = useEditorSelectorContext();
  const [lockScope] = useState(() => createViewLockScope(readOnly));
  const editor = useMemo(() => {
    if (directEditor) {
      return directEditor;
    }

    return createReactRuntimeViewEditor(
      getView(
        { authored, authorId, readOnly, root },
        presentation,
        undefined,
        mountedIn
      )
    ) as unknown as E;
    // Authored and read-only policy updates reconcile below without replacing
    // the view. Their current values seed only a new input/root lifetime.
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [directEditor, getView, lifetime, mountedIn, presentation, root]);
  const reactEditor = editor;
  const viewPresentation = getViewPresentation(reactEditor);
  // Insertion effects survive StrictMode replays and Activity hides, so a
  // surface keeps its resting carets until it really unmounts.
  useInsertionEffect(
    () => retainPresentation(viewPresentation),
    [viewPresentation]
  );
  useIsomorphicLayoutEffect(
    () => mountPliteViewSelection(reactEditor),
    [reactEditor]
  );
  useIsomorphicLayoutEffect(() => {
    if (authored) requestAuthoredView(reactEditor, authored);
    // Equivalent inline props must preserve a mode changed by view commands.
  }, [
    authored && ('intent' in authored ? authored.intent : authored.preview),
    reactEditor,
  ]);
  useInsertionEffect(() => {
    if (directEditor) return undefined;
    return () => setEditorReadOnly(reactEditor, true);
  }, [directEditor, reactEditor]);
  useInsertionEffect(() => {
    setViewLockScopeLocked(lockScope, readOnly);
    if (!directEditor) setEditorReadOnly(reactEditor, readOnly);
  }, [directEditor, lockScope, reactEditor, readOnly]);
  useInsertionEffect(
    () =>
      directEditor ? undefined : joinViewLockScope(lockScope, reactEditor),
    [directEditor, lockScope, reactEditor]
  );
  useInsertionEffect(() => {
    linkViewLockScope(lockScope, lockLink);
  }, [lockLink, lockScope]);
  useInsertionEffect(
    () => () => linkViewLockScope(lockScope, undefined),
    [lockScope]
  );
  const viewRoot = toInternalRoot(editor.read((state) => state.view.root()));
  const runtimeOwner = getEditorRuntimeOwner(reactEditor);
  const ownSlotInstance =
    contentRootInstance &&
    contentRootInstance.runtimeOwner === runtimeOwner &&
    contentRootInstance.childRoot === viewRoot &&
    mountedIn !== undefined
      ? contentRootInstance
      : null;
  const descendantInstanceContext = useMemo(
    () =>
      ownSlotInstance ?? {
        childRoot: viewRoot,
        hops: [],
        instanceKey: `${paneKey}:${viewRoot}`,
        paneKey,
        runtimeOwner,
      },
    [ownSlotInstance, paneKey, runtimeOwner, viewRoot]
  );
  const viewInstanceRef = useRef(descendantInstanceContext);
  useInsertionEffect(() => {
    viewInstanceRef.current = descendantInstanceContext;
  }, [descendantInstanceContext]);
  const { focused: isFocused } = useRuntimeFocusState(reactEditor);
  useInsertionEffect(
    () => registerHistoryStepView(reactEditor, viewRoot),
    [reactEditor, registerHistoryStepView, viewRoot]
  );
  useIsomorphicLayoutEffect(
    () => registerViewEditor(reactEditor, viewRoot, viewInstanceRef.current),
    [reactEditor, registerViewEditor, viewRoot]
  );
  useIsomorphicLayoutEffect(() => {
    updateViewInstance(reactEditor, descendantInstanceContext);
  }, [descendantInstanceContext, reactEditor, updateViewInstance]);
  // An insertion effect may not schedule updates, so the lock's notice goes
  // out here, before the commit that wrote it ends.
  useIsomorphicLayoutEffect(() => {
    flushEditorViewState(reactEditor);
    flushViewLockScope(lockScope);
  }, [lockLink, lockScope, reactEditor, readOnly]);
  const isOwnedChildRootSurface =
    !!ownSlotInstance ||
    (mountedIn === undefined &&
      !!presentation &&
      !!parentEditor &&
      getEditorRuntimeOwner(parentEditor) === runtimeOwner &&
      toInternalRoot(parentEditor.read((state) => state.view.root())) ===
        contentRootOwner?.ownerRoot);
  const ownContentRootOwner =
    contentRootOwner &&
    isOwnedChildRootSurface &&
    contentRootOwner.childRoot === viewRoot
      ? contentRootOwner
      : null;
  const hasViewSelection = usePliteViewSelectionPresence(reactEditor);
  const viewSelectionDecoration = useMemo(
    () =>
      createPliteViewSelectionDecorationSource(
        reactEditor,
        ownContentRootOwner
      ),
    [ownContentRootOwner, reactEditor]
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
      <ViewReadOnlyLock
        editor={reactEditor}
        link={lockLink}
        readOnly={readOnly}
        scope={lockScope}
        skip={Boolean(directEditor)}
      />
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
              <PliteEditingAreaContext value={false}>
                <ExplicitReadOnlyOverrideContext
                  value={
                    preserveReadOnlyOverride
                      ? inheritedExplicitReadOnly
                      : undefined
                  }
                >
                  <ReadOnlyContext value={readOnly}>
                    <FocusedContext value={isFocused}>
                      <ImperativeTextFlowContext
                        value={Boolean(parentEditor) || inheritedTextFlow}
                      >
                        <TextRenderScopeContext value="flat">
                          <SurfaceRuntimeScope
                            mountedEditor={reactEditor}
                            presentation={viewPresentation}
                          >
                            <PliteContentRootOwnerContext
                              value={ownContentRootOwner}
                            >
                              <PliteContentRootInstanceContext
                                value={descendantInstanceContext}
                              >
                                <ViewLockScopeContext value={lockScope}>
                                  {children}
                                </ViewLockScopeContext>
                              </PliteContentRootInstanceContext>
                            </PliteContentRootOwnerContext>
                          </SurfaceRuntimeScope>
                        </TextRenderScopeContext>
                      </ImperativeTextFlowContext>
                    </FocusedContext>
                  </ReadOnlyContext>
                </ExplicitReadOnlyOverrideContext>
              </PliteEditingAreaContext>
            </EditorContext>
          </DecorationSourcesContext>
        </DecorationRegistrationContext>
      </DecorationContext>
    </EditorSelectorContext>
  );
};

// React runs every snapshot in tree order before it removes, hides or inserts
// any node, so a lock applied here, first in the view root, binds every
// control's snapshot, a removed control's cleanup and a new custom element's
// connect in the render that sets it. An unlock stays in the insertion effect,
// so the lock it lifts still holds while the render removes and inserts nodes.
// oxlint-disable-next-line react/prefer-function-component -- [P0 React lifecycle] getSnapshotBeforeUpdate has no function-component equivalent.
class ViewReadOnlyLock extends Component<{
  editor: AnyEditor;
  link: ViewLockScope | undefined;
  readOnly: boolean;
  scope: ViewLockScope;
  skip: boolean;
}> {
  getSnapshotBeforeUpdate(prev: this['props']) {
    const { editor, link, readOnly, scope, skip } = this.props;

    if (prev.link !== link) linkViewLockScope(scope, link);
    if (!readOnly) return null;
    if (!prev.skip && prev.editor !== editor) {
      setEditorReadOnly(prev.editor, true);
    }
    if (prev.editor === editor && prev.readOnly) return null;

    setViewLockScopeLocked(scope, true);
    if (!skip) setEditorReadOnly(editor, true);

    return null;
  }

  // React warns about a snapshot without componentDidUpdate.
  componentDidUpdate() {}

  render() {
    return null;
  }
}

type ChangeCallbacksInput<E extends ReactEditorType<any, any>> = {
  editor: E;
  onChange: ReturnType<typeof useEditorSelectorContext>['onChange'];
  onCommit?: (context: CommitContext<E>) => void;
  onSelectionChange?: (context: SelectionChangeContext<E>) => void;
  onValueChange?: (context: ValueChangeContext<E>) => void;
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
      const publicRoot = toPublicRootOption(root);
      const textSync = profilePliteReactDuration('dom-text-sync', () =>
        syncChangedTextToDOM(
          editor,
          commit.changed.nodeKeys('text', publicRoot)
        )
      );
      if (commit.changed.has('structure', publicRoot)) {
        syncPliteNodePathBindingsToDOM(editor, commit.changed, publicRoot);
      }
      onChange(
        textSync.requiresGlobalRender ? undefined : commit,
        [
          ...getSchemaInvalidatedNodeKeys(editor, commit),
          ...textSync.invalidatedNodeKeys,
        ],
        publicRoot
      );
      const previousSnapshot = lastSnapshotRef.current;
      const valueChanged = didCommitChangePersistedValue(editor, commit);
      const selectionChanged =
        isRootSelectionChanged(root, commit) &&
        !SelectionApi.equals(previousSnapshot.selection, snapshot.selection);
      lastSnapshotRef.current = snapshot;

      const context = {
        commit,
        editor,
        snapshot,
      } as CommitContext<E>;
      const {
        onCommit: innerOnCommit,
        onSelectionChange: innerOnSelectionChange,
        onValueChange: innerOnValueChange,
      } = changeCallbacksCell.current;

      if (innerOnCommit) {
        runEditorObserver(
          editor,
          'commit-listener',
          () => {
            innerOnCommit(context);
          },
          'EditorRoot'
        );
      }

      if (valueChanged && innerOnValueChange) {
        const value = (getCommitDocumentValue(commit) ??
          editor.read.value()) as EditorDocumentValue<ReadValue<ValueOf<E>>>;

        runEditorObserver(
          editor,
          'commit-listener',
          () => {
            innerOnValueChange({
              ...context,
              value,
            });
          },
          'EditorRoot'
        );
      }

      if (selectionChanged && innerOnSelectionChange) {
        runEditorObserver(
          editor,
          'commit-listener',
          () => {
            innerOnSelectionChange({
              ...context,
              selection: snapshot.selection,
            });
          },
          'EditorRoot'
        );
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
    let lastShownPreview = readShownPreview(editor);
    const unsubscribeView = subscribeSharedEditorViewState(
      editor,
      'authored',
      () => {
        const nextPreview = readShownPreview(editor);
        const snapshot = editorGetSnapshot(editor);
        const childrenChanged =
          snapshot.children !== lastSnapshotRef.current.children;

        if (nextPreview === lastShownPreview && !childrenChanged) return;
        lastShownPreview = nextPreview;
        if (childrenChanged) {
          syncChangedTextToDOM(editor, []);
        }
        lastSnapshotRef.current = snapshot;
        onChange(undefined, [], editor.read.view.root(), {
          skipPublicSelectors: true,
        });
      }
    );
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
