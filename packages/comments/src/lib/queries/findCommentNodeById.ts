import type { PlateEditor } from '@udecode/plate/react';

import type { TCommentText } from '../types';

import { getCommentKey } from '../utils/getCommentKey';

export const findCommentNodeById = (editor: PlateEditor, id: string) => {
  return editor.api.node<TCommentText>({
    at: [],
    mode: 'lowest',
    match: (n) => n[getCommentKey(id)],
  });
};
