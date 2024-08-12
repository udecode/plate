import type { TNode } from '@udecode/plate-common';

import type { TCommentText } from '../types';

import { MARK_COMMENT } from '../constants';

export const isCommentText = (node: TNode): node is TCommentText => {
  return !!node[MARK_COMMENT];
};
