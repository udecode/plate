import type { TCommentText } from '../types';

import { getCommentCount } from './getCommentCount';

export const hasManyComments = (leaf: TCommentText) => {
  const count = getCommentCount(leaf);

  return count > 1;
};
