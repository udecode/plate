import { type Node, TextApi } from '@platejs/plite';
import { KEYS, type TCommentText } from '@platejs/utils';

export const isCommentText = (node: Node): node is TCommentText =>
  TextApi.isText(node) && !!node[KEYS.comment];
