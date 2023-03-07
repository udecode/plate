import {
  focusEditor,
  GetNodeEntriesOptions,
  removeNodes,
  TReactEditor,
  unhangRange,
  Value,
} from '@udecode/plate-common';
import { getBlocksWithId } from '../queries/getBlocksWithId';
import { getNodesRange } from '../queries/getNodesRange';

/**
 * Remove blocks with an id and focus the editor.
 */
export const removeBlocksAndFocus = <V extends Value>(
  editor: TReactEditor<V>,
  options: GetNodeEntriesOptions<V>
) => {
  unhangRange(editor, options?.at, options);

  const nodeEntries = getBlocksWithId(editor, options);

  removeNodes(editor, { at: getNodesRange(editor, nodeEntries) });
  focusEditor(editor);
};
