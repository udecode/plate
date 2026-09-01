import isEqual from 'lodash/isEqual.js';
import React from 'react';

import type {
  EditorCommitContext,
  EditorDocumentValue,
  EditorNodeChangeContext,
  EditorTextChangeContext,
  NodeEntry,
  Range,
  Selection,
} from '../../facade';
import { failInvariant } from '../../internal/failInvariant';
import { getPlateRuntime } from '../../internal/plugin/compilePlateModel';
import { subscribePlateChangeCallbacks } from '../../internal/plugin/plateChangeHandlers';
import type { EditableProps } from '../../lib/types/EditableProps';
import type { Editor } from '../editor/Editor';
import { getPlateEditorInstanceKey } from '../internal/getPlateEditorInstanceKey';
import { PlatePluginDecorationSources } from '../internal/PlatePluginDecorationSources';
import { PlateRuntimeContext } from '../internal/PlateRuntimeContext';
import { Plite } from '../internal/plite-components';
import { usePlateInstancesWarn } from '../internal/usePlateInstancesWarn';
import { usePlateModelRevision } from '../internal/usePlateModelRevision';
import {
  EditorReadOnlyProvider,
  type PliteAnnotationStore,
  type PliteDecorationSource,
} from '../plite-react';
import { PlateStoreProvider } from '../stores';

export type PlateSelectionChangeContext<E = Editor> = PlateCommitContext<E> & {
  selection: Selection;
};

export type PlateCommitContext<E = Editor> = Omit<
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

export type PlateValueChangeContext<E = Editor> = PlateCommitContext<E> & {
  value: EditorDocumentValue;
};

export interface PlateProps<E = Editor> {
  annotationStore?: PliteAnnotationStore<any, any> | null;
  children: React.ReactNode;

  decorate?: ((options: { editor: E; entry: NodeEntry }) => Range[]) | null;

  decorationSources?: ReadonlyArray<PliteDecorationSource<any>> | null;

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
  annotationStore,
  children,
  containerRef,
  decorate,
  decorationSources,
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
}: PlateProps & {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  const currentEditor = editor ?? failInvariant('Expected value to be defined');
  const modelRevision = usePlateModelRevision(currentEditor);
  const decorationPluginNames =
    getPlateRuntime(currentEditor).pluginCache.decorate;
  const [initialReadOnly] = React.useState(() =>
    currentEditor.read.view.isReadOnly()
  );
  const plateReadOnly = readOnly ?? initialReadOnly;
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
    <PlatePluginDecorationSources
      editor={currentEditor}
      names={decorationPluginNames}
      revision={modelRevision}
      sources={decorationSources}
    >
      {(compiledDecorationSources) => (
        <PlateRuntimeContext value>
          <Plite
            annotationStore={annotationStore}
            decorationSources={compiledDecorationSources}
            editor={currentEditor}
            readOnly={plateReadOnly}
          >
            <EditorReadOnlyProvider readOnly={plateReadOnly}>
              <PlateStoreProvider
                annotationStore={annotationStore}
                containerRef={containerRef}
                decorate={decorate}
                decorationSources={compiledDecorationSources}
                editor={currentEditor}
                primary={primary}
                renderElement={renderElement}
                renderLeaf={renderLeaf}
                scope={currentEditor.id}
              >
                {children}
              </PlateStoreProvider>
            </EditorReadOnlyProvider>
          </Plite>
        </PlateRuntimeContext>
      )}
    </PlatePluginDecorationSources>
  );
}

export function Plate<E = Editor>(
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
