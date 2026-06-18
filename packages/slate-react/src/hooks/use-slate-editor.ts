import { useState } from 'react';
import type { Value } from '@platejs/slate';

import {
  type CreateReactEditorOptions,
  createReactEditor,
  type ReactEditor,
} from '../plugin/with-react';

/** Options used to create a component-owned React editor. */
export type UseSlateEditorOptions<
  V extends Value = Value,
  TExtensions extends readonly unknown[] = readonly [],
> = CreateReactEditorOptions<V, TExtensions>;

/**
 * Creates one React editor instance for the component lifetime.
 *
 * Use this inside a component or custom hook that owns the editor lifetime.
 * `initialValue` seeds the editor once; replace document content later through
 * editor commands instead of changing props. Use `createReactEditor` when an
 * editor must be created outside React ownership.
 */
export const useSlateEditor = <
  V extends Value = Value,
  const TExtensions extends readonly unknown[] = readonly [],
>(
  options: UseSlateEditorOptions<V, TExtensions> = {}
): ReactEditor<V, TExtensions> => {
  const [editor] = useState(() => createReactEditor(options));

  return editor;
};
