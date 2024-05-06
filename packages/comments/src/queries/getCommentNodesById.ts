import {
  type PlateEditor,
  type Value,
  getNodeEntries,
} from '@udecode/plate-common/server';

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
