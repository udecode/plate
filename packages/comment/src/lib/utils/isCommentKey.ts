import { KEYS } from '@platejs/utils';

export const isCommentKey = (key: string) => key.startsWith(`${KEYS.comment}_`);
