import type { Descendant } from '@platejs/plite';
import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx';
import type { Node as UnistNode } from 'unist';

import type { MdRootContent } from '../mdast';
import type { MdDecoration } from '../types';
import type { DeserializeMdOptions } from './deserializeMd';

import { mdastToPlate } from '../types';
import { customMdxDeserialize } from './utils';
import { getDeserializerByKey } from './utils/getDeserializerByKey';

export const convertNodesDeserialize = (
  nodes: MdRootContent[],
  deco: MdDecoration,
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
  mdastNode: UnistNode,
  deco: MdDecoration,
  options: DeserializeMdOptions
): Descendant[] => {
  /** Handle custom mdx nodes */
  if (isMdxJsxNode(mdastNode)) {
    const result = customMdxDeserialize(mdastNode, deco, options);
    return Array.isArray(result) ? result : [result];
  }

  const type = mdastToPlate(options.editor!, mdastNode.type);

  const nodeParser = getDeserializerByKey(type, options);

  if (nodeParser) {
    const result = nodeParser(mdastNode, deco, options);
    return Array.isArray(result) ? result : [result];
  }
  return [];
};

const isMdxJsxNode = (
  node: UnistNode
): node is MdxJsxFlowElement | MdxJsxTextElement =>
  node.type === 'mdxJsxTextElement' || node.type === 'mdxJsxFlowElement';

const shouldIncludeNode = (
  node: MdRootContent,
  options: DeserializeMdOptions
): boolean => {
  const { allowedNodes, allowNode, disallowedNodes } = options;

  if (!node.type) return true;

  const type = mdastToPlate(options.editor!, node.type);

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
