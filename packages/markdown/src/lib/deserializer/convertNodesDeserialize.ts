import type { Descendant } from '@udecode/plate';

import type { MdRootContent } from '../mdast';
import type { deserializeOptions } from './deserializeMd';
import type { Decoration } from './type';

import { defaultNodes } from '../nodesRule';
import { getPlateNodeType } from '../utils';
import { convertChildren } from './covertChildren';

export const convertNodesDeserialize = (
  nodes: MdRootContent[],
  deco: Decoration,
  options: deserializeOptions
): Descendant[] => {
  return nodes.reduce<Descendant[]>((acc, node) => {
    acc.push(...buildSlateNode(node, deco, options));
    return acc;
  }, []);
};

export const buildSlateNode = (
  mdastNode: MdRootContent,
  deco: Decoration,
  options: deserializeOptions
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
    const result = nodeParser(mdastNode, deco, options);
    return Array.isArray(result) ? result : [result];
  }
  return [];
};
