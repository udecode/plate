import { useCallback } from 'react';
import type {
  Editor,
  EditorStateField,
  EditorUpdatePolicyFor,
  StateFieldValueInput,
} from '@platejs/plite';
import { withPliteReactPreservedSelection } from '../update-policy';
import { PliteReactUpdatePolicy } from '../update-policy';
import type { ReactEditor } from '../plugin/with-react';

import { useEditor } from './use-editor';
import {
  type EditorStateSelectorOptions,
  useEditorState,
} from './use-editor-selector';

/** Selector options for subscribing to one editor state field. */
export type UseStateFieldValueOptions<
  TValue,
  TEditor extends Editor<any> = ReactEditor<any>,
> = Pick<
  EditorStateSelectorOptions<TValue, TEditor>,
  'deferred' | 'equalityFn'
>;

/** Setter returned by `useSetStateField` for one editor state field. */
export type StateFieldSetter<
  TValue,
  TEditor extends Editor<any> = ReactEditor<any>,
> = (
  value: StateFieldValueInput<TValue>,
  policy?: EditorUpdatePolicyFor<TEditor>
) => void;

/**
 * Subscribe to one `defineStateField` value.
 *
 * The hook only re-renders when the field key appears in the committed dirty
 * state keys. Use it for document meta controls such as title, page settings,
 * or feature state that should not subscribe to every editor change.
 */
export function useStateFieldValue<
  TValue,
  TEditor extends Editor<any> = ReactEditor<any>,
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
 * an update policy when history or tags need additional control.
 */
export function useSetStateField<
  TValue,
  TEditor extends Editor<any> = ReactEditor<any>,
>(field: EditorStateField<TValue>): StateFieldSetter<TValue, TEditor> {
  const editor = useEditor<TEditor>();

  return useCallback(
    (
      value: StateFieldValueInput<TValue>,
      policy?: EditorUpdatePolicyFor<TEditor>
    ) => {
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
