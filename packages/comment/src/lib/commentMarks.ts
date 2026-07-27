import { type Node, TextApi } from '@platejs/plite';
import { KEYS, type TCommentText } from '@platejs/utils';

export const getCommentKey = (id: string) => `${KEYS.comment}_${id}`;

export const getCommentKeyId = (key: string) =>
  key.replace(`${KEYS.comment}_`, '');

export const getDraftCommentKey = () => `${KEYS.comment}_draft`;

/** Do not start with comment_ to avoid conflict with other comment keys. */
export const getTransientCommentKey = () => `${KEYS.comment}Transient`;

export const isCommentKey = (key: string) => key.startsWith(`${KEYS.comment}_`);

export const getCommentKeys = (node: TCommentText) =>
  Object.keys(node).filter(isCommentKey);

export const getCommentCount = (node: TCommentText) =>
  getCommentKeys(node).filter((key) => key !== getDraftCommentKey()).length;

/** Whether the node has a comment id. */
export const isCommentNodeById = (node: Node, id: string) =>
  TextApi.isText(node) && !!node[getCommentKey(id)];

export const isCommentText = (node: Node): node is TCommentText =>
  TextApi.isText(node) && !!node[KEYS.comment];
