import castArray from 'lodash/castArray';
import { Editor } from 'slate';

/**
 * Get editor node entries by id.
 */
export const getNodesById = (editor: Editor, id: string | string[]) => {
  const ids = castArray(id);

  return [
    ...Editor.nodes(editor, {
      mode: 'highest',
      match: (n) => {
        const nodeId = n.id as string | undefined;
        return !!nodeId && ids.includes(nodeId);
      },
      at: [],
    }),
  ];
};
