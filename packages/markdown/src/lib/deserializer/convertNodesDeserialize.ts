import type { Descendant } from '@udecode/plate';

import type { MdRootContent } from '../mdast';
import type { DeserializeMdOptions } from './deserializeMd';
import type { Decoration } from './type';

import { defaultNodes } from '../nodesRule';
import { getPlateNodeType } from '../utils';
import { convertChildren } from './covertChildren';

export const convertNodesDeserialize = (
  nodes: MdRootContent[],
  deco: Decoration,
  options: DeserializeMdOptions
): Descendant[] => {
  return nodes.reduce<Descendant[]>((acc, node) => {
    // Only process nodes that pass the filtering
    if (shouldIncludeNode(node, options)) {
      acc.push(...buildSlateNode(node, deco, options));
    }
    return acc;
  }, []);
};

export const buildSlateNode = (
  mdastNode: MdRootContent,
  deco: Decoration,
  options: DeserializeMdOptions
): Descendant[] => {
  const optionNodes = options.nodes;

  /** Handle custom mdx nodes */
  if (mdastNode.type === 'mdxJsxTextElement') {
    if (mdastNode.name === 'br') {
      const parserKey = mdastNode.name;
      const nodeParserDeserialize =
        optionNodes?.[parserKey]?.deserialize ??
        defaultNodes[parserKey]?.deserialize;

      if (nodeParserDeserialize)
        return nodeParserDeserialize(mdastNode, deco, options);

      return [{ text: '\n' }];
    }

    if (mdastNode.name === 'u') {
      const parserKey = 'underline';

      const nodeParserDeserialize =
        optionNodes?.[parserKey]?.deserialize ??
        defaultNodes[parserKey]?.deserialize;

      if (nodeParserDeserialize)
        return nodeParserDeserialize(mdastNode, deco, options) as any;

      return convertChildren(mdastNode.children, { underline: true }, options);
    }
  }

  const type = getPlateNodeType(mdastNode.type);

  const nodeParser =
    options.nodes?.[type]?.deserialize ?? defaultNodes[type]?.deserialize;

  if (nodeParser) {
    const result = nodeParser(mdastNode as any, deco, options);
    return Array.isArray(result) ? result : [result];
  }
  return [];
};

const shouldIncludeNode = (
  node: MdRootContent,
  options: DeserializeMdOptions
): boolean => {
  const { allowedNodes, allowNode, disallowedNodes } = options;

  if (!node.type) return true;

  const type = getPlateNodeType(node.type);

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
    if (!allowedNodes.includes(type)) {
      return false;
    }
  } else if (disallowedNodes?.includes(type)) {
    // If using disallowedNodes, exclude if the type is in disallowedNodes
    return false;
  }

  // Finally, check allowNode if provided
  if (allowNode?.deserialize) {
    return allowNode.deserialize({
      ...node,
      type,
    });
  }

  return true;
};
