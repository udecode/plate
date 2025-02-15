import type { PlateEditor } from '@udecode/plate/react';

import type { TCommentText } from '../types';

import { isCommentNodeById } from '../utils/isCommentNodeById';

export const getCommentNodesById = (editor: PlateEditor, id: string) => {
  return Array.from(
    editor.api.nodes<TCommentText>({
      at: [],
      match: (n) => isCommentNodeById(n, id),
    })
  );
};
