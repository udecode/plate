import { EditorNodesOptions, getNodes } from '@udecode/slate-plugins-common';
import { TEditor } from '@udecode/slate-plugins-core';
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
