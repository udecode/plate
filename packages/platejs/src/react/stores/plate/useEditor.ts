import React from 'react';

import {
  type EditorStateField,
  type EditorStateView,
  type NamedRootKey,
  type PluginsOf,
  type Range,
  RangeApi,
  type RootKey,
  type ValueOf,
  withPliteReactPreservedSelection,
} from '../../../facade';
import type { Editor } from '../../editor';
import {
  outsideEveryProvider,
  readBoolean,
  subscribeNothing,
  PlateModelContext,
  usePickedRoot,
  usePlateScope,
  usePlateTarget,
  useTargetViewState,
} from '../../internal/plate-context';
import {
  type EditorRuntimeStateSelectorOptions,
  ReactUpdatePolicy,
  type StateFieldSetter,
  type UseRootEditorOptions,
  useEditorRootElement,
  useEditorRuntimeState,
  useRootEditor as usePliteRootEditor,
} from '../../plite-react';

/** Get the editor selected by the nearest Plate, PlateController, or EditorProvider. */
export function useEditor(): Editor {
  if (arguments.length > 0) {
    throw new Error(
      'useEditor() takes no arguments. Call useCreateEditor(options, deps) to create an editor.'
    );
  }
  const editor = useOptionalEditor();
  if (!editor) throw new Error('useEditor() requires an active Plate editor.');
  return editor;
}

/** Get the complete document editor owned by the nearest EditorRoot. */
export function useModelEditor(): Editor {
  const editor = (usePickedRoot()?.model ?? React.use(PlateModelContext))
    ?.editor;
  if (!editor) {
    throw new Error('useModelEditor() requires an active EditorRoot.');
  }
  return editor;
}

/** Get the provider's selected editor, or null when no editor is available. */
export function useOptionalEditor(): Editor | null {
  if (arguments.length > 0) {
    throw new Error(
      'useOptionalEditor() takes no arguments. Call useCreateEditor(options, deps) to create an editor.'
    );
  }
  return usePlateTarget()?.editor ?? null;
}

/** Return a command-capable Plate editor for one root under the nearest EditorRoot. */
export function useRootEditor<const TRoot extends RootKey = RootKey>(
  root?: NamedRootKey<TRoot>,
  options?: UseRootEditorOptions
): Editor {
  return usePliteRootEditor(root, options) as unknown as Editor;
}

/** Get the selected editor's application ID. */
export const useEditorId = (): string => useEditor().id;

const noEditorDOM = {
  api: { dom: { editable: () => null, root: () => null, scroll: () => null } },
};

/** Whether the selected command view has a mounted editable. */
export const useEditorMounted = (): boolean => {
  const { server } = usePlateScope();
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
export const useEditorReadOnly = (): boolean =>
  useTargetViewState(
    usePlateTarget(),
    'readOnly',
    usePlateScope() !== outsideEveryProvider
  );

/** Get the selected Plate container ref; its value is null before mount. */
export function useEditorContainerRef(): React.RefObject<HTMLDivElement | null> {
  const target = usePlateTarget();
  const emptyRef = React.useRef<HTMLDivElement>(null);
  return target?.containerRef ?? emptyRef;
}

/** Get the selected view's Editable ref; its value is null before mount. */
export function useEditableRef(): React.RefObject<HTMLElement | null> {
  const target = usePlateTarget();
  const emptyRef = React.useRef<HTMLElement>(null);
  return target?.editableRef ?? emptyRef;
}

/** Get the selected root's text selection. */
export const useEditorSelection = (): Range | null =>
  useEditorRuntimeState(useEditor(), (state) => state.selection(), {
    dependsOn: ['selection', 'document'],
    equalityFn: RangeApi.equals,
  });

/** Whether the selected root has a text selection, including a caret. */
export const useEditorHasSelection = (): boolean =>
  useEditorRuntimeState(useEditor(), (state) => state.selection() !== null, {
    dependsOn: 'selection',
  });

/** Options for Plate's `useEditorState` selector hook. */
export type UseEditorStateOptions<T = unknown> =
  EditorRuntimeStateSelectorOptions<T>;

/** Subscribe to a value derived from the selected editor's immutable state. */
export const useEditorState = <T>(
  selector: (state: EditorStateView<ValueOf<Editor>, PluginsOf<Editor>>) => T,
  options: UseEditorStateOptions<T> = {}
): T => useEditorRuntimeState(useEditor(), selector, options);

/** Get the selected root's children. */
export const useEditorValue = () =>
  useEditorRuntimeState(useEditor(), (state) => state.children(), {
    dependsOn: 'document',
    equalityFn: Object.is,
  });

/** Options for Plate's `useStateFieldValue` selector hook. */
export type UseStateFieldValueOptions<TValue = unknown> = Pick<
  UseEditorStateOptions<TValue>,
  'equalityFn'
>;

/** Subscribe to one `defineStateField` value on the selected Plate editor. */
export function useStateFieldValue<TValue>(
  field: EditorStateField<TValue>,
  options: UseStateFieldValueOptions<TValue> = {}
): TValue {
  return useEditorState<TValue>((state) => state.getField(field), {
    ...options,
    dependsOn: field,
  });
}

/** Create a setter for one `defineStateField` value on the selected Plate editor. */
export function useSetStateField<TValue>(
  field: EditorStateField<TValue>
): StateFieldSetter<TValue> {
  const editor = useEditor();

  return React.useCallback<StateFieldSetter<TValue>>(
    (value, policy) => {
      editor.update(
        policy
          ? withPliteReactPreservedSelection(policy)
          : ReactUpdatePolicy.preserveSelection,
        (tx) => {
          tx.setField(field, value);
        }
      );
    },
    [editor, field]
  );
}
