import { EditorNodesOptions } from '@udecode/slate-plugins-common';
import { Editor } from 'slate';

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
