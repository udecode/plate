import { EditorNodesOptions, getNodes, TEditor } from '@udecode/plate-core';
import { Editor } from 'slate';

/**
 * Get blocks with an id
 */
export const getBlocksWithId = (
  editor: TEditor,
  options: EditorNodesOptions
) => {
  return [
    ...getNodes(editor, {
      match: (n) => Editor.isBlock(editor, n) && !!n.id,
      ...options,
    }),
  ];
};
