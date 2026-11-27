import { useCallback } from 'react';

import type {
  EditorStateField,
  EditorUpdatePolicy,
  StateFieldValueInput,
} from '../..';
import {
  withPliteReactPreservedSelection,
  ReactUpdatePolicy,
} from '../update-policy';
import {
  type EditorSelectorOptions,
  useEditorSelector,
} from './use-editor-selector';
import { useEditor } from './use-plite-runtime';

/** Selector options for subscribing to one editor state field. */
export type UseStateFieldValueOptions<TValue> = Pick<
  EditorSelectorOptions<TValue>,
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
 * The hook re-evaluates when the field key or `'$configuration'` appears in
 * the committed dirty state keys (for example on plugin uninstall or
 * reinstall), and re-renders only when the value changes. Use it for document
 * meta controls such as title, page settings, or feature state that should not
 * subscribe to every editor change.
 */
export function useStateFieldValue<TValue>(
  field: EditorStateField<TValue>,
  options: UseStateFieldValueOptions<TValue> = {}
): TValue {
  return useEditorSelector<TValue>((editor) => editor.read.getField(field), {
    ...options,
    dependsOn: field,
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
        editor.update(ReactUpdatePolicy.preserveSelection, (tx) => {
          tx.setField(field, value);
        });
      }
    },
    [editor, field]
  );
}
