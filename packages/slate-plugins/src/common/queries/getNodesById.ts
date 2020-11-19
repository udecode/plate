import castArray from 'lodash/castArray';
import { Editor } from 'slate';
import { EditorNodesOptions } from '../types/Editor.types';

/**
 * Get editor node entries by id.
 */
export const getNodesById = (
  editor: Editor,
  id: string | string[],
  editorNodesOptions?: EditorNodesOptions
) => {
  const ids = castArray(id);

  const nodes = Editor.nodes(editor, {
    mode: 'all',
    match: (n) => {
      const nodeId = n.id as string | undefined;
      return !!nodeId && ids.includes(nodeId);
    },
    at: [],
    ...editorNodesOptions,
  });

  return [...nodes];
};
