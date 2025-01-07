import type { ReplaceNodesOptions, ValueOf } from '@udecode/slate';

import type { SlateEditor } from '../editor';

/** Replace editor children by default block. */
export const resetEditorChildren = <E extends SlateEditor = SlateEditor>(
  editor: E,
  options?: Omit<ReplaceNodesOptions<ValueOf<E>>, 'at' | 'children'>
) => {
  editor.tf.replaceNodes(editor.api.create.value(), {
    at: [],
    children: true,
    ...options,
  } as any);
};
