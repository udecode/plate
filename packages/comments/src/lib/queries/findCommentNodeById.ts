import { type SlateEditor, findNode } from '@udecode/plate-common';

import type { TCommentText } from '../types';

import { getCommentKey } from '../utils';

export const findCommentNodeById = (editor: SlateEditor, id: string) => {
  return findNode<TCommentText>(editor, {
    at: [],
    match: (n) => n[getCommentKey(id)],
  });
};
