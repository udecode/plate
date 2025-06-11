import { KEYS } from 'platejs';

export const isCommentKey = (key: string) => key.startsWith(`${KEYS.comment}_`);
