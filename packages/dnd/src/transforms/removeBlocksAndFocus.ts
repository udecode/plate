import {
  type GetNodeEntriesOptions,
  type Value,
  getNodesRange,
  removeNodes,
  unhangRange,
} from '@udecode/plate-common';
import { type TReactEditor, focusEditor } from '@udecode/plate-common/react';

import { getBlocksWithId } from '../queries/getBlocksWithId';

/** Remove blocks with an id and focus the editor. */
export const removeBlocksAndFocus = <V extends Value>(
  editor: TReactEditor<V>,
  options: GetNodeEntriesOptions<V>
) => {
  unhangRange(editor, options?.at, options);

  const nodeEntries = getBlocksWithId(editor, options);

  removeNodes(editor, { at: getNodesRange(editor, nodeEntries) });
  focusEditor(editor);
};
