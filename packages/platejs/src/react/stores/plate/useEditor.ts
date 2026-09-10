import React from 'react';

import {
  type EditorCommit,
  type EditorStateView,
  type ExtensionsOf,
  type Range,
  RangeApi,
  type ValueOf,
} from '../../../facade';
import type { Editor } from '../../editor';
import {
  PlateEditorContext,
  PlateViewFactsContext,
} from '../../internal/plate-context';
import {
  type EditorRuntimeStateSelectorOptions,
  useEditorRuntimeState,
} from '../../plite-react';

const childrenChanged = (change?: EditorCommit) =>
  Boolean(change?.changed.hasAny('document'));

const selectionChanged = (change?: { selectionChanged?: boolean }) =>
  Boolean(change?.selectionChanged);

/** Get the editor selected by the nearest Plate, PlateController, or EditorProvider. */
export function useEditor(): Editor {
  const editor = useOptionalEditor();
  if (!editor) throw new Error('useEditor() requires an active Plate editor.');
  return editor;
}

/** Get the provider's selected editor, or null when no editor is available. */
export function useOptionalEditor(): Editor | null {
  return React.useContext(PlateEditorContext)?.editor ?? null;
}

/** Get the selected editor's application ID. */
export const useEditorId = (): string => useEditor().id;

/** Whether the selected command view has a mounted editable. */
export const useEditorMounted = (): boolean =>
  React.useContext(PlateViewFactsContext).mounted;

/** Whether the selected command view is currently focused. */
export const useEditorFocused = (): boolean =>
  React.useContext(PlateViewFactsContext).focused;

/** Whether the selected command view is composing text. */
export const useEditorComposing = (): boolean =>
  React.useContext(PlateViewFactsContext).composing;

/** Whether the selected command view rejects editing, including after unmount. */
export const useEditorReadOnly = (): boolean =>
  React.useContext(PlateViewFactsContext).readOnly;

/** Get the selected Plate container ref; its value is null before mount. */
export function useEditorContainerRef(): React.RefObject<HTMLDivElement | null> {
  const target = React.useContext(PlateEditorContext);
  const emptyRef = React.useRef<HTMLDivElement>(null);
  return target?.containerRef ?? emptyRef;
}

/** Get the selected root's text selection. */
export const useEditorSelection = (): Range | null =>
  useEditorRuntimeState(useEditor(), (state) => state.selection(), {
    equalityFn: RangeApi.equals,
    shouldUpdate: selectionChanged,
  });

/** Whether the selected root has a text selection, including a caret. */
export const useEditorHasSelection = (): boolean =>
  useEditorRuntimeState(useEditor(), (state) => state.selection() !== null, {
    shouldUpdate: selectionChanged,
  });

export type UseEditorStateOptions<T> = EditorRuntimeStateSelectorOptions<
  T,
  Editor
>;

/** Subscribe to a value derived from the selected editor's immutable state. */
export const useEditorState = <T>(
  selector: (
    state: EditorStateView<ValueOf<Editor>, ExtensionsOf<Editor>>
  ) => T,
  options: UseEditorStateOptions<T> = {}
): T => useEditorRuntimeState(useEditor(), selector, options);

/** Get the selected root's children. */
export const useEditorValue = () =>
  useEditorRuntimeState(useEditor(), (state) => state.children(), {
    shouldUpdate: childrenChanged,
  });
