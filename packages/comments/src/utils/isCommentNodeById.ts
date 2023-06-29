import { TNode } from '@udecode/plate-common';

import { getCommentKey } from './getCommentKey';

/**
 * Whether the node has a comment id.
 */
export const isCommentNodeById = (node: TNode, id: string) =>
  !!node[getCommentKey(id)];
