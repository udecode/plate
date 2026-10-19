import isEqual from 'lodash/isEqual.js';
import React from 'react';

import type {
  EditorCommitContext,
  EditorDocumentValue,
  EditorNodeChangeContext,
  EditorTextChangeContext,
  EditorViewOptions,
  Selection,
} from '../../facade';
import { failInvariant } from '../../internal/failInvariant';
import { getPlateDecorationSources } from '../../internal/plugin/getPlateDecorationSources';
import { subscribePlateChangeCallbacks } from '../../internal/plugin/plateChangeHandlers';
import type { Editor } from '../editor/Editor';
import { createPlateTargetScope } from '../internal/createPlateTargetScope';
import { getPlateEditorInstanceKey } from '../internal/getPlateEditorInstanceKey';
import {
  PlateModelContext,
  PlateScopeProvider,
  type PlateTarget,
} from '../internal/plate-context';
import { EditorRoot as RuntimeEditorRoot } from '../internal/plite-components';
import { usePlateInstancesWarn } from '../internal/usePlateInstancesWarn';
import { usePlateModelRevision } from '../internal/usePlateModelRevision';
import { EditorReadOnlyProvider, useEditorViewState } from '../plite-react';

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

export interface EditorRootProps<E = Editor> {
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
  const [scope] = React.useState(() => createPlateTargetScope<PlateTarget>());
  const editableRef = React.useRef<HTMLDivElement>(null);
  const fallback = React.useMemo(
    () => ({ editor: currentEditor, containerRef, editableRef }),
    [containerRef, currentEditor]
  );
  const modelRevision = usePlateModelRevision(currentEditor);
  const decorations = React.useMemo(() => {
    void modelRevision;

    return getPlateDecorationSources(currentEditor);
  }, [currentEditor, modelRevision]);
  const editorReadOnly = useEditorViewState(currentEditor, (view) =>
    view.isReadOnly()
  );
  const plateReadOnly = readOnly ?? editorReadOnly;
  const model = React.useMemo(
    () => ({
      authored,
      editor: currentEditor,
      containerRef,
      primary: primary ?? true,
      readOnly: plateReadOnly,
      scope,
    }),
    [authored, containerRef, currentEditor, plateReadOnly, primary, scope]
  );
  const observerBaselineVersion = React.useMemo(
    () => editor?.read.lastCommit()?.version ?? 0,
    [editor]
  );
  const lastObservedCommitVersion = React.useRef(observerBaselineVersion);
  const observersRef = React.useRef({
    onCommit,
    onSelectionChange,
    onValueChange,
  });
  const lastDocumentValueRef = React.useRef<EditorDocumentValue | undefined>(
    undefined
  );

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
    lastObservedCommitVersion.current = observerBaselineVersion;
    lastDocumentValueRef.current = observedEditor.read.value();

    const observeCommit: Parameters<
      typeof observedEditor.subscribeCommit
    >[0] = (commit, snapshot) => {
      lastObservedCommitVersion.current = commit.version;

      const {
        onCommit: innerOnCommit,
        onSelectionChange: innerOnSelectionChange,
        onValueChange: innerOnValueChange,
      } = observersRef.current;
      if (!innerOnCommit && !innerOnSelectionChange && !innerOnValueChange) {
        return;
      }

      const documentChanged = commit.changed.hasAny('document');
      const stateChanged = commit.dirtyStateKeys.length > 0;
      const value = innerOnValueChange
        ? documentChanged || stateChanged
          ? observedEditor.read.value()
          : (lastDocumentValueRef.current ?? observedEditor.read.value())
        : null;
      const persistedMetaChanged =
        !!value &&
        stateChanged &&
        !isEqual(lastDocumentValueRef.current?.meta, value.meta);

      if (value && (documentChanged || stateChanged)) {
        lastDocumentValueRef.current = value;
      }

      const context = { commit, editor: observedEditor, snapshot };

      innerOnCommit?.(context);

      if (value && (documentChanged || persistedMetaChanged)) {
        innerOnValueChange?.({
          ...context,
          value,
        });
      }

      if (
        commit.selectionChanged &&
        (commit.selectionBeforeRoot === undefined ||
          commit.selectionAfterRoot === undefined)
      ) {
        innerOnSelectionChange?.({
          ...context,
          selection: snapshot.selection,
        });
      }
    };

    const unsubscribe = observedEditor.subscribeCommit(observeCommit);
    const latestCommit = observedEditor.read.lastCommit();

    if (
      latestCommit &&
      latestCommit.version > lastObservedCommitVersion.current
    ) {
      observeCommit(
        latestCommit,
        observedEditor.read((state) => state.runtime.snapshot())
      );
    }

    return unsubscribe;
  }, [editor, observerBaselineVersion]);

  return (
    <RuntimeEditorRoot
      authored={authored}
      decorations={decorations}
      editor={currentEditor}
      readOnly={plateReadOnly}
    >
      <EditorReadOnlyProvider readOnly={plateReadOnly}>
        <PlateModelContext value={model}>
          <PlateScopeProvider
            scope={scope}
            fallback={fallback}
            fallbackReadOnly={plateReadOnly}
          >
            {children}
          </PlateScopeProvider>
        </PlateModelContext>
      </EditorReadOnlyProvider>
    </RuntimeEditorRoot>
  );
}

export function EditorRoot<E = Editor>(
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
