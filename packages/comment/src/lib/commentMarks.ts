import { type Node, type Text, TextApi } from '@platejs/plite';

export const getCommentKey = (id: string): `comment_${string}` =>
  `comment_${id}`;

export const getCommentKeyId = (key: string) => key.replace('comment_', '');

export const getDraftCommentKey = () => 'comment_draft' as const;

/** Do not start with comment_ to avoid conflict with other comment keys. */
export const getTransientCommentKey = () => 'commentTransient' as const;

export const isCommentKey = (key: string) => key.startsWith('comment_');

export const getCommentKeys = (node: Text) =>
  Object.keys(node).filter(isCommentKey);

export const getCommentCount = (node: Text) =>
  getCommentKeys(node).filter((key) => key !== getDraftCommentKey()).length;

/** Whether the node has a comment id. */
export const isCommentNodeById = (node: Node, id: string) =>
  TextApi.isText(node) && !!node[getCommentKey(id)];

export const isCommentText = (node: Node): node is Text =>
  TextApi.isText(node) && !!node.comment;
