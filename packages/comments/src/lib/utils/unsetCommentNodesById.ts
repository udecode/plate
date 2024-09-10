import { type SlateEditor, unsetNodes } from '@udecode/plate-common';

import type { TCommentText } from '../types';

import { getCommentKey } from './getCommentKey';
import { isCommentNodeById } from './isCommentNodeById';

export const unsetCommentNodesById = (
  editor: SlateEditor,
  { id }: { id: string }
) => {
  unsetNodes<TCommentText>(editor, getCommentKey(id), {
    at: [],
    match: (n) => isCommentNodeById(n, id),
  });
};
