import type { Descendant } from 'platejs';

import type { MdRootContent } from '../mdast';
import type { MdDecoration } from '../types';
import type { DeserializeMdOptions } from './deserializeMd';

import { mdastToPlate } from '../types';
import { customMdxDeserialize } from './utils';
import { shouldDeserializeNode } from './internal/shouldDeserializeNode';
import { getDeserializerByKey } from './utils/getDeserializerByKey';

export const convertNodesDeserialize = (
  nodes: MdRootContent[],
  deco: MdDecoration,
  options: DeserializeMdOptions
): Descendant[] => {
  return nodes.reduce<Descendant[]>((acc, node) => {
    // Only process nodes that pass the filtering
    if (shouldDeserializeNode(node, options)) {
      acc.push(...buildSlateNode(node, deco, options));
    }
    return acc;
  }, []);
};

export const buildSlateNode = (
  mdastNode: MdRootContent,
  deco: MdDecoration,
  options: DeserializeMdOptions
): Descendant[] => {
  /** Handle custom mdx nodes */
  if (
    mdastNode.type === 'mdxJsxTextElement' ||
    mdastNode.type === 'mdxJsxFlowElement'
  ) {
    const result = customMdxDeserialize(mdastNode, deco, options);
    return Array.isArray(result) ? result : [result];
  }

  const type = mdastToPlate(options.editor!, mdastNode.type);

  const nodeParser = getDeserializerByKey(type, options);

  if (nodeParser) {
    const result = nodeParser(mdastNode as any, deco, options);
    return Array.isArray(result) ? result : [result];
  }
  return [];
};
