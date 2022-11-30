import { TCommentText } from '../types';
import { isCommentKey } from './isCommentKey';

export const getCommentCount = (node: TCommentText) => {
  let commentCount = 0;
  Object.keys(node).forEach((key) => {
    if (isCommentKey(key)) commentCount++;
  });
  return commentCount;
};
