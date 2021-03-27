import { EditorNodesOptions, getNodes } from '@udecode/slate-plugins-common';
import { Editor } from 'slate';

/**
 * Get blocks with an id
 */
export const getBlocksWithId = (
  editor: Editor,
  options: EditorNodesOptions
) => {
  return [
    ...getNodes(editor, {
      match: (n) => Editor.isBlock(editor, n) && !!n.id,
      ...options,
    }),
  ];
};
