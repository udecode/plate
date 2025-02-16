import type { Value } from '@udecode/plate';

import { getCommentKey } from './getCommentKey';

/** Check if the comment exists in the editor children */
export const isExistComment = (id: string, contentRich: Value | undefined) => {
  if (!contentRich) return false;

  const regex = new RegExp(`"${getCommentKey(id)}":true`);

  return regex.test(JSON.stringify(contentRich));
};
