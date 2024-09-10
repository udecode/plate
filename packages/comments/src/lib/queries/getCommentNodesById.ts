import { type SlateEditor, getNodeEntries } from '@udecode/plate-common';

import { isCommentNodeById } from '../utils';

export const getCommentNodesById = (editor: SlateEditor, id: string) => {
  return Array.from(
    getNodeEntries(editor, {
      at: [],
      match: (n) => isCommentNodeById(n, id),
    })
  );
};
