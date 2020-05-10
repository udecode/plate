import { isAncestor } from 'common/queries';
import { Descendant, Element, Node, Text } from 'slate';

/**
 * Recursively set properties to all Element nodes
 */
export const setPropsToDescendants = (
  node: Node,
  properties: Record<string, any>
) => {
  if (Element.isElement(node) || Text.isText(node)) {
    Object.assign(node, properties);
  }

  if (!isAncestor(node)) return;

  node.children.forEach((child: Descendant) => {
    setPropsToDescendants(child, properties);
  });
};
