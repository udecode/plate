import { Editor } from 'slate';
import { EditorNodesOptions } from '../../common/types/Editor.types';

/**
 * Get blocks with an id
 */
export const getBlocks = (editor: Editor, options: EditorNodesOptions) => {
  return [
    ...Editor.nodes(editor, {
      match: (n) => Editor.isBlock(editor, n) && !!n.id,
      ...options,
    }),
  ];
};
