import { TNode } from '@udecode/plate-common';
import { MARK_COMMENT } from '../constants';
import { TCommentText } from '../types';

export const isCommentText = (node: TNode): node is TCommentText => {
  return !!node[MARK_COMMENT];
};
