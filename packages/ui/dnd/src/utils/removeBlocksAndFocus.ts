import {
  EditorNodesOptions,
  focusEditor,
  removeNodes,
  TReactEditor,
  unhangRange,
  Value,
} from '@udecode/plate-core';
import { getBlocksWithId } from './getBlocksWithId';
import { getNodesRange } from './getNodesRange';

/**
 * Remove blocks with an id and focus the editor.
 */
export const removeBlocksAndFocus = <V extends Value>(
  editor: TReactEditor<V>,
  options: EditorNodesOptions<V>
) => {
  unhangRange(editor, options?.at, options);

  const nodeEntries = getBlocksWithId(editor, options);

  removeNodes(editor, { at: getNodesRange(editor, nodeEntries) });
  focusEditor(editor);
};
