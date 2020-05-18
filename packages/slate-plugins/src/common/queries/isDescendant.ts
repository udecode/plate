import { Descendant, Element, Node, Text } from 'slate';

export const isDescendant = (node: Node): node is Descendant =>
  Element.isElement(node) || Text.isText(node);
