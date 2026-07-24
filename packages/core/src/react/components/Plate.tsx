import React from 'react';

import type {
  EditorCommitContext,
  EditorDocumentValue,
  EditorNodeChangeContext,
  EditorTextChangeContext,
  Selection,
  ValueOf,
} from '@platejs/plite';
import { EditorReadOnlyProvider } from '@platejs/plite-react';
import isEqual from 'lodash/isEqual.js';

import type { EditableProps } from '../../lib/types/EditableProps';
import type { PlateEditor } from '../editor/PlateEditor';

import { usePlateInstancesWarn } from '../../internal/hooks/usePlateInstancesWarn';
import { subscribePlateChangeCallbacks } from '../../internal/plugin/plateChangeHandlers';
import { getPlateEditorInstanceKey } from '../internal/getPlateEditorInstanceKey';
import { type PlateStoreState, PlateStoreProvider } from '../stores';

export type PlateSelectionChangeContext<E extends PlateEditor = PlateEditor> =
  EditorCommitContext<E> & {
    selection: Selection;
  };

export type PlateValueChangeContext<E extends PlateEditor = PlateEditor> =
  EditorCommitContext<E> & {
    value: EditorDocumentValue<ValueOf<E>>;
  };

export interface PlateProps<E extends PlateEditor = PlateEditor>
  extends Partial<Pick<PlateStoreState<E>, 'decorate' | 'primary'>> {
  children: React.ReactNode;

  editor: E | null;

  /** Observe every published editor commit. */
  onCommit?: (context: EditorCommitContext<E>) => void;

  /** Observe canonical node changes for this editor. */
  onNodeChange?: (context: EditorNodeChangeContext<E>) => void;

  /** Observe commits that change the primary-root selection. */
  onSelectionChange?: (context: PlateSelectionChangeContext<E>) => void;

  /** Observe canonical text changes for this editor. */
  onTextChange?: (context: EditorTextChangeContext<E>) => void;

  /** Observe commits that change the full serializable document value. */
  onValueChange?: (context: PlateValueChangeContext<E>) => void;

  readOnly?: boolean;

  renderElement?: EditableProps['renderElement'];

  renderLeaf?: EditableProps['renderLeaf'];

  suppressInstanceWarning?: boolean;
}

function PlateInner<E extends PlateEditor = PlateEditor>({
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
}: PlateProps<E> & {
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

export function Plate<E extends PlateEditor = PlateEditor>(
  props: PlateProps<E>
) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  usePlateInstancesWarn(props.suppressInstanceWarning);

  if (!props.editor) return null;

  return (
    <PlateInner<E>
      key={getPlateEditorInstanceKey(props.editor)}
      containerRef={containerRef}
      {...props}
    />
  );
}
