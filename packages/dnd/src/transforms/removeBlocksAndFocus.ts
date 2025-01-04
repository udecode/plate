import type {
  GetNodeEntriesOptions,
  TEditor,
  ValueOf,
} from '@udecode/plate-common';

import { getBlocksWithId } from '../queries/getBlocksWithId';

/** Remove blocks with an id and focus the editor. */
export const removeBlocksAndFocus = <E extends TEditor = TEditor>(
  editor: E,
  options: GetNodeEntriesOptions<ValueOf<E>>
) => {
  editor.api.unhangRange(options?.at as any, options);

  const nodeEntries = getBlocksWithId(editor, options);

  editor.tf.removeNodes({ at: editor.api.nodesRange(nodeEntries) });
  editor.tf.focus();
};
