import type { TNode } from '@udecode/plate-common';

import type { TCommentText } from '../types';

import { CommentsPlugin } from '../CommentsPlugin';

export const isCommentText = (node: TNode): node is TCommentText => {
  return !!node[CommentsPlugin.key];
};
