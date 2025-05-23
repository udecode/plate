import { type TNode, KEYS } from '@udecode/plate';

export const isHeading = (node: TNode) => {
  return node.type && KEYS.heading.includes(node.type as any);
};
