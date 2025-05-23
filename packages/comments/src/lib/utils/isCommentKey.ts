import { KEYS } from '@udecode/plate';

export const isCommentKey = (key: string) => key.startsWith(`${KEYS.comment}_`);
