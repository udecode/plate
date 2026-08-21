import type {
  EditorStateField,
  EditorUpdatePolicy,
  StateFieldValueInput,
} from '@platejs/plite';
import { useCallback } from 'react';

import {
  withPliteReactPreservedSelection,
  PliteReactUpdatePolicy,
} from '../update-policy';
import { useEditor } from './use-editor';
import {
  type EditorStateSelectorOptions,
  useEditorState,
} from './use-editor-selector';

/** Selector options for subscribing to one editor state field. */
export type UseStateFieldValueOptions<TValue> = Pick<
  EditorStateSelectorOptions<TValue>,
  'deferred' | 'equalityFn'
>;

/** Setter returned by `useSetStateField` for one editor state field. */
export type StateFieldSetter<TValue> = (
  value: StateFieldValueInput<TValue>,
  policy?: EditorUpdatePolicy
) => void;

/**
 * Subscribe to one `defineStateField` value.
 *
 * The hook only re-renders when the field key appears in the committed dirty
 * state keys. Use it for document meta controls such as title, page settings,
 * or feature state that should not subscribe to every editor change.
 */
export function useStateFieldValue<TValue>(
  field: EditorStateField<TValue>,
  options: UseStateFieldValueOptions<TValue> = {}
): TValue {
  return useEditorState<TValue>((state) => state.getField(field), {
    ...options,
    shouldUpdate: (change) =>
      Boolean(change?.dirtyStateKeys.includes(field.key)),
  });
}

/**
 * Create a setter for one `defineStateField` value.
 *
 * The setter writes through `editor.update` and preserves DOM selection by
 * default so external controls can update state without stealing focus. Pass
 * an update policy when history or tags need additional control.
 */
export function useSetStateField<TValue>(
  field: EditorStateField<TValue>
): StateFieldSetter<TValue> {
  const editor = useEditor();

  return useCallback(
    (value: StateFieldValueInput<TValue>, policy?: EditorUpdatePolicy) => {
      if (policy) {
        editor.update(withPliteReactPreservedSelection(policy), (tx) => {
          tx.setField(field, value);
        });
      } else {
        editor.update(PliteReactUpdatePolicy.preserveSelection, (tx) => {
          tx.setField(field, value);
        });
      }
    },
    [editor, field]
  );
}
