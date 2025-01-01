import {
  type GetNodeEntriesOptions,
  type TEditor,
  type ValueOf,
  getNodesRange,
  removeNodes,
  unhangRange,
} from '@udecode/plate-common';

import { getBlocksWithId } from '../queries/getBlocksWithId';

/** Remove blocks with an id and focus the editor. */
export const removeBlocksAndFocus = <E extends TEditor = TEditor>(
  editor: E,
  options: GetNodeEntriesOptions<ValueOf<E>>
) => {
  unhangRange(editor, options?.at as any, options);

  const nodeEntries = getBlocksWithId(editor, options);

  removeNodes(editor, { at: getNodesRange(editor, nodeEntries) });
  editor.tf.focus();
};
