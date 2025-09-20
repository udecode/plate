import { KEYS } from 'platejs';

/** Do not start with comment_ to avoid conflict with other comment keys */
export const getTransientCommentKey = () => `${KEYS.comment}Transient`;
