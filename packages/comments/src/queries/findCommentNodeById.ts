import { type PlateEditor, findNode } from '@udecode/plate-common';

import type { TCommentText } from '../types';

import { getCommentKey } from '../utils/getCommentKey';

export const findCommentNodeById = (editor: PlateEditor, id: string) => {
  return findNode<TCommentText>(editor, {
    at: [],
    match: (n) => n[getCommentKey(id)],
  });
};
