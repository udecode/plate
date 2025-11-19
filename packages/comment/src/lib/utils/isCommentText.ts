import type { TCommentText, TNode } from 'platejs';

import { KEYS } from 'platejs';

export const isCommentText = (node: TNode): node is TCommentText =>
  !!node[KEYS.comment];
