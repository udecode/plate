import type { SlateEditor } from '@udecode/plate';

import type { TCommentText } from '../types';

import { getCommentKey } from './getCommentKey';
import { isCommentNodeById } from './isCommentNodeById';

export const unsetCommentNodesById = (
  editor: SlateEditor,
  { id }: { id: string }
) => {
  editor.tf.unsetNodes<TCommentText>(getCommentKey(id), {
    at: [],
    match: (n) => isCommentNodeById(n, id),
  });
};
