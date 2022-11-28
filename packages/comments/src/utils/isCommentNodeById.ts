import { TNode } from '@udecode/plate-core';
import { getCommentKey } from './utils';

/**
 * Whether the node has a comment id.
 */
export const isCommentNodeById = (node: TNode, id: string) =>
  !!node[getCommentKey(id)];
