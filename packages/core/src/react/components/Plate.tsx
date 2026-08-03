import React from 'react';

import type {
  EditorCommitContext,
  EditorDocumentValue,
  EditorNodeChangeContext,
  EditorTextChangeContext,
  NodeEntry,
  Range,
  Selection,
  Value,
} from '@platejs/plite';
import { EditorReadOnlyProvider } from '@platejs/plite-react';
import isEqual from 'lodash/isEqual.js';

import type { EditableProps } from '../../lib/types/EditableProps';
import type { PlateEditor } from '../editor/PlateEditor';

import { usePlateInstancesWarn } from '../../internal/hooks/usePlateInstancesWarn';
import { subscribePlateChangeCallbacks } from '../../internal/plugin/plateChangeHandlers';
import { getPlateEditorInstanceKey } from '../internal/getPlateEditorInstanceKey';
import { PlateStoreProvider } from '../stores';

export type PlateSelectionChangeContext<E = PlateEditor> =
  PlateCommitContext<E> & {
    selection: Selection;
  };

export type PlateCommitContext<E = PlateEditor> = Omit<
  EditorCommitContext,
  'editor'
> & {
  editor: E;
};

type PlateNodeChangeContext<E> = Omit<EditorNodeChangeContext, 'editor'> & {
  editor: E;
};

type PlateTextChangeContext<E> = Omit<EditorTextChangeContext, 'editor'> & {
  editor: E;
};

export type PlateValueChangeContext<E = PlateEditor> = PlateCommitContext<E> & {
  value: EditorDocumentValue<Value>;
};

export interface PlateProps<E = PlateEditor> {
  children: React.ReactNode;

  decorate?: ((options: { editor: E; entry: NodeEntry }) => Range[]) | null;

  editor: E | null;

  /** Observe every published editor commit. */
  onCommit?: (context: PlateCommitContext<E>) => void;

  /** Observe canonical node changes for this editor. */
  onNodeChange?: (context: PlateNodeChangeContext<E>) => void;

  /** Observe commits that change the primary-root selection. */
  onSelectionChange?: (context: PlateSelectionChangeContext<E>) => void;

  /** Observe canonical text changes for this editor. */
  onTextChange?: (context: PlateTextChangeContext<E>) => void;

  /** Observe commits that change the full serializable document value. */
  onValueChange?: (context: PlateValueChangeContext<E>) => void;

  /** Whether this editor is the primary editor for its controller. */
  primary?: boolean;

  readOnly?: boolean;

  renderElement?: EditableProps['renderElement'];

  renderLeaf?: EditableProps['renderLeaf'];

  suppressInstanceWarning?: boolean;
}

function PlateInner({
  children,
  containerRef,
  decorate,
  editor,
  primary,
  readOnly,
  renderElement,
  renderLeaf,
  onCommit,
  onNodeChange,
  onSelectionChange,
  onTextChange,
  onValueChange,
}: PlateProps<PlateEditor> & {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const plateReadOnly = readOnly ?? editor?.read.view.isReadOnly();
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
  const lastDocumentValueRef = React.useRef(editor?.read.value());

  React.useInsertionEffect(() => {
    observersRef.current = {
      onCommit,
      onSelectionChange,
      onValueChange,
    };
  }, [onCommit, onSelectionChange, onValueChange]);

  React.useLayoutEffect(
    () =>
      subscribePlateChangeCallbacks(editor!, {
        onNodeChange,
        onTextChange,
      }),
    [editor, onNodeChange, onTextChange]
  );

  React.useLayoutEffect(() => {
    const currentEditor = editor!;
    lastObservedCommitVersion.current = observerBaselineVersion;
    lastDocumentValueRef.current = currentEditor.read.value();

    const observeCommit: Parameters<typeof currentEditor.subscribeCommit>[0] = (
      commit,
      snapshot
    ) => {
      lastObservedCommitVersion.current = commit.version;

      const { onCommit, onSelectionChange, onValueChange } =
        observersRef.current;
      const documentChanged = commit.changed.hasAny('document');
      const stateChanged = commit.dirtyStateKeys.length > 0;
      const value =
        documentChanged || stateChanged
          ? currentEditor.read.value()
          : (lastDocumentValueRef.current ?? currentEditor.read.value());
      const persistedMetaChanged =
        stateChanged &&
        !isEqual(lastDocumentValueRef.current?.meta, value.meta);

      if (documentChanged || stateChanged) {
        lastDocumentValueRef.current = value;
      }
      if (!onCommit && !onSelectionChange && !onValueChange) return;

      const context = { commit, editor: currentEditor, snapshot };

      onCommit?.(context);

      if (documentChanged || persistedMetaChanged) {
        onValueChange?.({
          ...context,
          value,
        });
      }

      if (
        commit.selectionChanged &&
        (commit.selectionBeforeRoot === undefined ||
          commit.selectionAfterRoot === undefined)
      ) {
        onSelectionChange?.({
          ...context,
          selection: snapshot.selection,
        });
      }
    };

    const unsubscribe = currentEditor.subscribeCommit(observeCommit);
    const latestCommit = currentEditor.read.lastCommit();

    if (
      latestCommit &&
      latestCommit.version > lastObservedCommitVersion.current
    ) {
      observeCommit(
        latestCommit,
        currentEditor.read((state) => state.runtime.snapshot())
      );
    }

    return unsubscribe;
  }, [editor, observerBaselineVersion]);

  return (
    <EditorReadOnlyProvider readOnly={plateReadOnly}>
      <PlateStoreProvider
        containerRef={containerRef}
        decorate={decorate}
        editor={editor!}
        primary={primary}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        scope={editor!.id}
      >
        {children}
      </PlateStoreProvider>
    </EditorReadOnlyProvider>
  );
}

export function Plate<E = PlateEditor>(
  props: PlateProps<E>
): React.ReactElement | null;
export function Plate(props: PlateProps<any>) {
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
