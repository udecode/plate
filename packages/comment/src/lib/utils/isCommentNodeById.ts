import { type Node, TextApi } from '@platejs/plite';

import { getCommentKey } from './getCommentKey';

/** Whether the node has a comment id. */
export const isCommentNodeById = (node: Node, id: string) =>
  TextApi.isText(node) && !!node[getCommentKey(id)];
