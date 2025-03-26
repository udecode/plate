import type { SlateEditor } from '@udecode/plate';

import { MarkdownPlugin } from '../../MarkdownPlugin';

const shouldIncludeNode = (node: any, editor: SlateEditor): boolean => {
  const { allowedNodes, allowNode, disallowedNodes } =
    editor.getOptions(MarkdownPlugin);

  if (!node.type) return true;

  // First check allowedNodes/disallowedNodes
  if (
    allowedNodes &&
    disallowedNodes &&
    allowedNodes.length > 0 &&
    disallowedNodes.length > 0
  ) {
    throw new Error('Cannot combine allowedNodes with disallowedNodes');
  }

  if (allowedNodes) {
    // If allowedNodes is specified, only include if the type is in allowedNodes
    if (!allowedNodes.includes(node.type)) {
      return false;
    }
  } else if (disallowedNodes?.includes(node.type)) {
    // If using disallowedNodes, exclude if the type is in disallowedNodes
    return false;
  }

  // Finally, check allowNode if provided
  if (allowNode?.deserialize) {
    return allowNode.deserialize(node);
  }

  return true;
};

export const filterNodes = (nodes: any[], editor: SlateEditor): any[] => {
  return nodes
    .map((node) => {
      if (Array.isArray(node)) {
        return filterNodes(node, editor);
      }

      if (typeof node === 'object' && node !== null) {
        if (!shouldIncludeNode(node, editor)) {
          return null;
        }

        if (node.children) {
          return {
            ...node,
            children: filterNodes(node.children, editor).filter(Boolean),
          };
        }
      }

      return node;
    })
    .filter(Boolean);
};
