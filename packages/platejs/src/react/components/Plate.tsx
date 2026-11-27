import React from 'react';

import type {
  EditorCommitContext,
  EditorDocumentValue,
  EditorNodeChangeContext,
  EditorTextChangeContext,
  EditorViewOptions,
  Selection,
} from '../../facade';
import {
  createEditorCommitPublicationQueue,
  didCommitChangePersistedValue,
  getCommitDocumentValue,
  publishEditorCommitInVersionOrder,
  resetEditorCommitPublicationQueue,
  runEditorObserver,
} from '../../facade';
import { failInvariant } from '../../internal/failInvariant';
import { getPlateDecorationSources } from '../../internal/plugin/getPlateDecorationSources';
import { subscribePlateChangeCallbacks } from '../../internal/plugin/plateChangeHandlers';
import type { Editor, EditorReference } from '../editor/Editor';
import { getPlateEditorInstanceKey } from '../internal/getPlateEditorInstanceKey';
import {
  PlateCaretScope,
  PlateModelContext,
  PlateReadOnlyContext,
} from '../internal/plate-context';
import { EditorRoot as RuntimeEditorRoot } from '../internal/plite-components';
import { usePlateInstancesWarn } from '../internal/usePlateInstancesWarn';
import { usePlateModelRevision } from '../internal/usePlateModelRevision';
import { useEditorSelector } from '../stores/plate/useEditorSelector';

export type SelectionChangeContext<E = Editor> = CommitContext<E> & {
  selection: Selection;
};

export type CommitContext<E = Editor> = Omit<EditorCommitContext, 'editor'> & {
  editor: E;
};

type NodeChangeContext<E> = Omit<EditorNodeChangeContext, 'editor'> & {
  editor: E;
};

type TextChangeContext<E> = Omit<EditorTextChangeContext, 'editor'> & {
  editor: E;
};

export type ValueChangeContext<E = Editor> = CommitContext<E> & {
  value: EditorDocumentValue;
};

export interface EditorRootProps<E extends EditorReference = Editor> {
  /** Native authored input and projection for this mounted view. */
  authored?: NoInfer<E> extends { read: { authored: unknown } }
    ? EditorViewOptions['authored']
    : never;
  children: React.ReactNode;
  editor: E | null;

  /** Observe every published editor commit. */
  onCommit?: (context: CommitContext<E>) => void;

  /** Observe canonical node changes for this editor. */
  onNodeChange?: (context: NodeChangeContext<E>) => void;

  /** Observe commits that change the primary-root selection. */
  onSelectionChange?: (context: SelectionChangeContext<E>) => void;

  /** Observe canonical text changes for this editor. */
  onTextChange?: (context: TextChangeContext<E>) => void;

  /** Observe commits that change the full serializable document value. */
  onValueChange?: (context: ValueChangeContext<E>) => void;

  /** Whether this editor is the primary editor for its controller. */
  primary?: boolean;

  readOnly?: boolean;

  suppressInstanceWarning?: boolean;
}

function PlateInner({
  authored,
  children,
  containerRef,
  editor,
  primary,
  readOnly,
  onCommit,
  onNodeChange,
  onSelectionChange,
  onTextChange,
  onValueChange,
}: Omit<EditorRootProps, 'authored'> & {
  authored?: EditorViewOptions['authored'];
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const currentEditor = editor ?? failInvariant('Expected value to be defined');
  const modelRevision = usePlateModelRevision(currentEditor);
  const decorations = React.useMemo(() => {
    void modelRevision;

    return getPlateDecorationSources(currentEditor);
  }, [currentEditor, modelRevision]);
  const editorReadOnly = useEditorSelector(
    currentEditor,
    (current) => current.read.view.isReadOnly(),
    { dependsOn: 'readOnly' }
  );
  const plateReadOnly = readOnly ?? editorReadOnly;
  const model = React.useMemo(
    () => ({ editor: currentEditor, containerRef }),
    [containerRef, currentEditor]
  );
  const observerBaseline = React.useMemo(
    () => ({ version: editor?.read.lastCommit()?.version ?? 0 }),
    [editor]
  );
  const [commitPublicationQueue] = React.useState(() =>
    createEditorCommitPublicationQueue(observerBaseline.version)
  );
  const observerBaselineRef = React.useRef<typeof observerBaseline | null>(
    null
  );
  const observersRef = React.useRef({
    onCommit,
    onSelectionChange,
    onValueChange,
  });

  React.useInsertionEffect(() => {
    observersRef.current = {
      onCommit,
      onSelectionChange,
      onValueChange,
    };
  }, [onCommit, onSelectionChange, onValueChange]);

  React.useLayoutEffect(
    () =>
      subscribePlateChangeCallbacks(
        editor ?? failInvariant('Expected value to be defined'),
        {
          onNodeChange,
          onTextChange,
        }
      ),
    [editor, onNodeChange, onTextChange]
  );

  React.useLayoutEffect(() => {
    const observedEditor =
      editor ?? failInvariant('Expected value to be defined');
    if (observerBaselineRef.current !== observerBaseline) {
      observerBaselineRef.current = observerBaseline;
      resetEditorCommitPublicationQueue(
        commitPublicationQueue,
        observerBaseline.version
      );
    }

    const observeCommit: Parameters<
      typeof observedEditor.subscribeCommit
    >[0] = (commit, snapshot) => {
      const {
        onCommit: innerOnCommit,
        onSelectionChange: innerOnSelectionChange,
        onValueChange: innerOnValueChange,
      } = observersRef.current;
      if (!innerOnCommit && !innerOnSelectionChange && !innerOnValueChange) {
        return;
      }

      const valueChanged = didCommitChangePersistedValue(
        observedEditor,
        commit
      );
      const context = { commit, editor: observedEditor, snapshot };

      runEditorObserver(
        observedEditor,
        'commit-listener',
        () => {
          innerOnCommit?.(context);
        },
        'EditorRoot'
      );

      if (valueChanged && innerOnValueChange) {
        const value =
          getCommitDocumentValue(commit) ?? observedEditor.read.value();

        runEditorObserver(
          observedEditor,
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

      if (
        commit.selectionChanged &&
        (commit.selectionBeforeRoot === undefined ||
          commit.selectionAfterRoot === undefined)
      ) {
        runEditorObserver(
          observedEditor,
          'commit-listener',
          () => {
            innerOnSelectionChange?.({
              ...context,
              selection: snapshot.selection,
            });
          },
          'EditorRoot'
        );
      }
    };

    const unsubscribe = observedEditor.subscribeCommit((commit, snapshot) => {
      publishEditorCommitInVersionOrder(
        commitPublicationQueue,
        commit,
        snapshot,
        observeCommit,
        { allowVersionGap: false }
      );
    });
    const latestCommit = observedEditor.read.lastCommit();

    if (
      latestCommit &&
      latestCommit.version > commitPublicationQueue.lastVersion
    ) {
      publishEditorCommitInVersionOrder(
        commitPublicationQueue,
        latestCommit,
        observedEditor.read((state) => state.runtime.snapshot()),
        observeCommit,
        { allowVersionGap: true }
      );
    }

    return unsubscribe;
  }, [commitPublicationQueue, editor, observerBaseline]);

  return (
    <RuntimeEditorRoot
      authored={authored}
      decorations={decorations}
      editor={currentEditor}
      readOnly={plateReadOnly}
    >
      <PlateReadOnlyContext value={plateReadOnly}>
        <PlateModelContext value={model}>
          <PlateCaretScope primary={primary ?? true}>
            {children}
          </PlateCaretScope>
        </PlateModelContext>
      </PlateReadOnlyContext>
    </RuntimeEditorRoot>
  );
}

export function EditorRoot<E extends EditorReference = Editor>(
  props: EditorRootProps<E>
): React.ReactElement | null;
export function EditorRoot(props: EditorRootProps<any>) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  usePlateInstancesWarn(props.suppressInstanceWarning);

  if (!props.editor) return null;

  return (
    <PlateInner
      key={getPlateEditorInstanceKey(props.editor)}
      containerRef={containerRef}
      {...props}
    />
  );
}
