import type { TCommentText } from '@platejs/utils';

import { getDraftCommentKey } from './getDraftCommentKey';
import { isCommentKey } from './isCommentKey';

export const getCommentCount = (node: TCommentText) => {
  let commentCount = 0;
  Object.keys(node).forEach((key) => {
    if (isCommentKey(key) && key !== getDraftCommentKey()) commentCount++;
  });

  return commentCount;
};
