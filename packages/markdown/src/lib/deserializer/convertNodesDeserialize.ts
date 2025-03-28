import type { Descendant } from '@udecode/plate';

import type { MdRootContent } from '../mdast';
import type { deserializeOptions } from './deserializeMd';
import type { Decoration } from './type';

import { defaultNodes } from '../nodesRule';
import { getPlateNodeType } from '../utils';

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
  const type = getPlateNodeType(mdastNode.type);

  const NodeParserDeserialize =
    options.nodes?.[type]?.deserialize ?? defaultNodes[type]?.deserialize;

  if (NodeParserDeserialize) {
    const result = NodeParserDeserialize(mdastNode, deco, options);
    return Array.isArray(result) ? result : [result];
  }
  return [];
};
