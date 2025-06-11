import { KEYS } from '@udecode/plate';

export const getCommentKeyId = (key: string) =>
  key.replace(`${KEYS.comment}_`, '');
