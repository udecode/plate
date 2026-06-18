import { useCallback } from 'react';
import type {
  Editor,
  EditorStateField,
  EditorUpdateOptions,
  StateFieldValueInput,
} from '@platejs/slate';

import { useEditor } from './use-editor';
import {
  type EditorStateSelectorOptions,
  useEditorState,
} from './use-editor-selector';

/** Selector options for subscribing to one editor state field. */
export type UseStateFieldValueOptions<
  TValue,
  TEditor extends Editor<any> = Editor<any>,
> = Pick<
  EditorStateSelectorOptions<TValue, TEditor>,
  'deferred' | 'equalityFn'
>;

/** Setter returned by `useSetStateField` for one editor state field. */
export type StateFieldSetter<TValue> = (
  value: StateFieldValueInput<TValue>,
  options?: EditorUpdateOptions
) => void;

const getStateFieldSetterOptions = (
  options: EditorUpdateOptions = {}
): EditorUpdateOptions => ({
  ...options,
  metadata: {
    ...options.metadata,
    selection: {
      dom: 'preserve',
      focus: false,
      scroll: false,
      ...options.metadata?.selection,
    },
  },
});

/**
 * Subscribe to one `defineStateField` value.
 *
 * The hook only re-renders when the field key appears in the committed dirty
 * state keys. Use it for document state controls such as title, page settings,
 * or feature state that should not subscribe to every editor change.
 */
export function useStateFieldValue<
  TValue,
  TEditor extends Editor<any> = Editor<any>,
>(
  field: EditorStateField<TValue>,
  options: UseStateFieldValueOptions<TValue, TEditor> = {}
): TValue {
  return useEditorState<TValue, TEditor>((state) => state.getField(field), {
    ...options,
    deps: [field],
    shouldUpdate: (change) =>
      Boolean(change?.dirtyStateKeys.includes(field.key)),
  });
}

/**
 * Create a setter for one `defineStateField` value.
 *
 * The setter writes through `editor.update` and preserves DOM selection by
 * default so external controls can update state without stealing focus. Pass
 * update options when a tag or collaboration metadata is needed.
 */
export function useSetStateField<
  TValue,
  TEditor extends Editor<any> = Editor<any>,
>(field: EditorStateField<TValue>): StateFieldSetter<TValue> {
  const editor = useEditor<TEditor>();

  return useCallback(
    (value: StateFieldValueInput<TValue>, options?: EditorUpdateOptions) => {
      editor.update((tx) => {
        tx.setField(field, value);
      }, getStateFieldSetterOptions(options));
    },
    [editor, field]
  );
}
