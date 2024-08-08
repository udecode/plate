import { type PlateEditor, getNodeEntries } from '@udecode/plate-common/server';

import { isCommentNodeById } from '../utils/isCommentNodeById';

export const getCommentNodesById = (editor: PlateEditor, id: string) => {
  return Array.from(
    getNodeEntries(editor, {
      at: [],
      match: (n) => isCommentNodeById(n, id),
    })
  );
};
