import { MARK_COMMENT } from '../constants';

export const getCommentKeyId = (key: string) =>
  key.replace(`${MARK_COMMENT}_`, '');
