import { KEYS } from 'platejs';

export const getCommentKeyId = (key: string) =>
  key.replace(`${KEYS.comment}_`, '');
