import type { Descendant } from '@udecode/plate';
import type { Root } from 'mdast';

import type * as mdast from '../mdast';
import type { deserializeOptions } from './deserializeMd';
import type { Decoration } from './type';

import { defaultNodes } from '../nodesRule';
import { getPlateNodeType } from '../utils';

export const mdastToSlate = (
  node: Root,
  options: deserializeOptions
): Descendant[] => {
  return buildSlateRoot(node, options);
};

const buildSlateRoot = (
  root: mdast.Root,
  options: deserializeOptions
): Descendant[] => {
  return convertNodesDeserialize(root.children, {}, options);
};

export const convertNodesDeserialize = (
  nodes: mdast.RootContent[],
  deco: Decoration,
  options: deserializeOptions
): Descendant[] => {
  return nodes.reduce<Descendant[]>((acc, node) => {
    acc.push(...buildSlateNode(node, deco, options));
    return acc;
  }, []);
};

const buildSlateNode = (
  mdastNode: mdast.RootContent,
  deco: Decoration,
  options: deserializeOptions
): Descendant[] => {
  mdastNode.type === 'linkReference';

  const type = getPlateNodeType(mdastNode.type);

  const NodeParserDeserialize =
    options.nodes?.[type]?.deserialize ?? defaultNodes[type]?.deserialize;

  if (NodeParserDeserialize) {
    return [NodeParserDeserialize(mdastNode, deco, options)];
  }
  return [];
};
