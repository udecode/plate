import { KEYS } from 'platejs';

export const getCommentKey = (id: string) => `${KEYS.comment}_${id}`;
