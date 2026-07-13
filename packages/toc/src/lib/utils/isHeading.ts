import { type Node, ElementApi } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

export const isHeading = (node: Node) =>
  ElementApi.isElement(node) &&
  typeof node.type === 'string' &&
  KEYS.heading.some((type) => type === node.type);
