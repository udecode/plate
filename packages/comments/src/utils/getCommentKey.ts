import { MARK_COMMENT } from '../constants';

export const getCommentKey = (id: string) => `${MARK_COMMENT}_${id}`;
