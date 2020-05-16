import { Descendant, Node, Text } from 'slate';

/**
 * Recursively set properties to all Text nodes below a node
 */
export const setPropsToTexts = (
  node: Node,
  properties: Record<string, any>
) => {
  if (Text.isText(node)) return Object.assign(node, properties);

  node.children.forEach((child: Descendant) => {
    setPropsToTexts(child, properties);
  });
};
