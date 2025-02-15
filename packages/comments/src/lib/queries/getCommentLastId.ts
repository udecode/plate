import type { TCommentText } from '../types';

import { getDraftCommentKey, isCommentKey } from '../utils';
import { getCommentId } from '../utils/getCommentKeyId';

export const getCommentLastId = (leaf: TCommentText) => {
  const ids: string[] = [];
  const keys = Object.keys(leaf);

  if (keys.includes(getDraftCommentKey())) return;

  keys.forEach((key) => {
    if (!isCommentKey(key) || key === getDraftCommentKey()) return;

    // block the resolved id

    const id = getCommentId(key);
    ids.push(id);
  });

  return ids.at(-1);
};
