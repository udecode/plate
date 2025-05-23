import type { TNode } from '@udecode/plate';

import { KEYS } from '@udecode/plate';

import type { TCommentText } from '../types';

export const isCommentText = (node: TNode): node is TCommentText => {
  return !!node[KEYS.comment];
};
