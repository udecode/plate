import type { TCommentText } from '../types';

import { isCommentKey } from './isCommentKey';

export const getCommentKeys = (node: TCommentText) => {
  const keys: string[] = [];

  Object.keys(node).forEach((key) => {
    if (isCommentKey(key)) keys.push(key);
  });

  return keys;
};
