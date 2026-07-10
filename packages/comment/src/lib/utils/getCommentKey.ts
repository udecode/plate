import { KEYS } from '@platejs/utils';

export const getCommentKey = (id: string) => `${KEYS.comment}_${id}`;
