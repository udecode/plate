import type { Editor, EditorNodesOptions, ValueOf } from '@udecode/plate';

import { getBlocksWithId } from '../queries/getBlocksWithId';

/** Remove blocks with an id and focus the editor. */
export const removeBlocksAndFocus = <E extends Editor = Editor>(
  editor: E,
  options: EditorNodesOptions<ValueOf<E>>
) => {
  const nodeEntries = getBlocksWithId(editor, options);

  editor.tf.removeNodes({ at: editor.api.nodesRange(nodeEntries) });
  editor.tf.focus();
};
