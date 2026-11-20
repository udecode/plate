import React from 'react';

import {
  type EditorCommit,
  type EditorStateView,
  type PluginsOf,
  type Range,
  RangeApi,
  type ValueOf,
} from '../../../facade';
import { failInvariant } from '../../../internal/failInvariant';
import type { Editor } from '../../editor';
import {
  outsideEveryProvider,
  PlateModelContext,
  PlateScopeContext,
  readBoolean,
  subscribeNothing,
  usePlateTarget,
  useTargetViewState,
} from '../../internal/plate-context';
import {
  type EditorRuntimeStateSelectorOptions,
  useEditorRootElement,
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

/** Get the complete document editor owned by the nearest EditorRoot. */
export function useModelEditor(): Editor {
  const editor = React.useContext(PlateModelContext)?.editor;
  if (!editor) {
    throw new Error('useModelEditor() requires an active EditorRoot.');
  }
  return editor;
}

/** Get the provider's selected editor, or null when no editor is available. */
export function useOptionalEditor(): Editor | null {
  return usePlateTarget()?.editor ?? null;
}

/** Get the selected editor's application ID. */
export const useEditorId = (): string => useEditor().id;

const noEditorDOM = {
  api: { dom: { editable: () => null, root: () => null, scroll: () => null } },
};

/** Whether the selected command view has a mounted editable. */
export const useEditorMounted = (): boolean => {
  const { server } = React.useContext(PlateScopeContext);
  const mounted =
    useEditorRootElement(useOptionalEditor() ?? noEditorDOM) != null;
  return React.useSyncExternalStore(
    subscribeNothing,
    readBoolean(mounted),
    readBoolean(server?.mounted ?? false)
  );
};

/** Whether the selected command view is currently focused. */
export const useEditorFocused = (): boolean =>
  useTargetViewState(usePlateTarget(), 'focused', false);

/** Whether the selected command view is composing text. */
export const useEditorComposing = (): boolean =>
  useTargetViewState(usePlateTarget(), 'composing', false);

/** Whether the selected command view rejects editing, including after unmount. */
export const useEditorReadOnly = (): boolean => {
  const scope = React.useContext(PlateScopeContext);
  const target = usePlateTarget();
  const rootAnswer = target !== null && target === scope.fallback;
  const readOnly = useTargetViewState(
    rootAnswer ? null : target,
    'readOnly',
    scope !== outsideEveryProvider
  );
  return rootAnswer
    ? (React.use(PlateModelContext) ?? failInvariant('Expected an EditorRoot'))
        .readOnly
    : readOnly;
};

/** Get the selected Plate container ref; its value is null before mount. */
export function useEditorContainerRef(): React.RefObject<HTMLDivElement | null> {
  const target = usePlateTarget();
  const emptyRef = React.useRef<HTMLDivElement>(null);
  return target?.containerRef ?? emptyRef;
}

/**
 * Get the selected view's Editable ref; its value is null before mount. Inside
 * `EditorSelectionView` it is the Editable of the view holding the selection.
 */
export function useEditableRef(): React.RefObject<HTMLElement | null> {
  const target = usePlateTarget();
  const emptyRef = React.useRef<HTMLElement>(null);
  return target?.editableRef ?? emptyRef;
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
  selector: (state: EditorStateView<ValueOf<Editor>, PluginsOf<Editor>>) => T,
  options: UseEditorStateOptions<T> = {}
): T => useEditorRuntimeState(useEditor(), selector, options);

/** Get the selected root's children. */
export const useEditorValue = () =>
  useEditorRuntimeState(useEditor(), (state) => state.children(), {
    equalityFn: Object.is,
    shouldUpdate: childrenChanged,
  });
