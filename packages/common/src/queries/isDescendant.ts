import { Descendant, Element, Text } from 'slate';

export const isDescendant = (node: any): node is Descendant =>
  Element.isElement(node) || Text.isText(node);
