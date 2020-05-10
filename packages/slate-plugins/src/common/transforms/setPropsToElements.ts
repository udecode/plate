import { isAncestor } from 'common/queries';
import { Descendant, Element, Node } from 'slate';

/**
 * Recursively set properties to all Element nodes
 */
export const setPropsToElements = (
  node: Node,
  properties: Record<string, any>
) => {
  if (Element.isElement(node)) {
    Object.assign(node, properties);
  }

  if (!isAncestor(node)) return;

  node.children.forEach((child: Descendant) => {
    setPropsToElements(child, properties);
  });
};
