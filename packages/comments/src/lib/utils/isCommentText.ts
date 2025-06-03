import type { TCommentText, TNode } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

export const isCommentText = (node: TNode): node is TCommentText => {
  return !!node[KEYS.comment];
};
