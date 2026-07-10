import { KEYS } from '@platejs/utils';

export const getCommentKeyId = (key: string) =>
  key.replace(`${KEYS.comment}_`, '');
