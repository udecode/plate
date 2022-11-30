import { getNodeEntries, PlateEditor, Value } from '@udecode/plate-core';
import { isCommentNodeById } from '../utils/isCommentNodeById';

export const getCommentNodesById = <V extends Value>(
  editor: PlateEditor<V>,
  id: string
) => {
  return Array.from(
    getNodeEntries(editor, {
      at: [],
      match: (n) => isCommentNodeById(n, id),
    })
  );
};
