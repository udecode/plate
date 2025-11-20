import { type TNode, KEYS } from 'platejs';

export const isHeading = (node: TNode) =>
  node.type && KEYS.heading.includes(node.type as any);
