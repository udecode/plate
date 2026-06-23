import { type Node, NodeApi } from '@platejs/slate';

const isCaptionNode = (node: unknown): node is Node => NodeApi.isNode(node);

export const stringifyCaption = (caption: unknown) =>
  Array.isArray(caption)
    ? caption.filter(isCaptionNode).map(NodeApi.string).join('')
    : '';
