import { Editor } from 'slate';
import { getNodes } from '../../common/queries/getNodes';
import { EditorNodesOptions } from '../../common/types/Editor.types';

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
