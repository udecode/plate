import { MARK_COMMENT } from '../constants';

export const isCommentKey = (key: string) => key.startsWith(`${MARK_COMMENT}_`);
