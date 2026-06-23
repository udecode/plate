import { getCommentKey } from './getCommentKey';

/** Whether the node has a comment id. */
export const isCommentNodeById = (node: unknown, id: string) =>
  typeof node === 'object' &&
  node !== null &&
  !!(node as Record<string, unknown>)[getCommentKey(id)];
