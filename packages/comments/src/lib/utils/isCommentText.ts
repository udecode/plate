import type { TNode } from '@udecode/plate-common';

import type { TCommentText } from '../types';

import { BaseCommentsPlugin } from '../BaseCommentsPlugin';

export const isCommentText = (node: TNode): node is TCommentText => {
  return !!node[BaseCommentsPlugin.key];
};
