import type { TCommentText } from 'platejs';

import { KEYS } from 'platejs';

export const isCommentText = (node: unknown): node is TCommentText =>
  typeof node === 'object' &&
  node !== null &&
  !!(node as Record<string, unknown>)[KEYS.comment];
