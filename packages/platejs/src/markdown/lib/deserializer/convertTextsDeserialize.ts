import type { Descendant } from '../../../core';
import type { MdDelete, MdEmphasis, MdStrong } from '../mdast';
import type { DeserializeMdContext, MdDecoration } from '../types';
import { mdastToRule } from '../types';
import { buildSlateNode } from './convertNodesDeserialize';

export const convertTextsDeserialize = (
  mdastNode: MdDelete | MdEmphasis | MdStrong,
  deco: MdDecoration,
  options: DeserializeMdContext
) =>
  mdastNode.children.reduce<Descendant[]>((acc, node) => {
    const key = mdastToRule(mdastNode.type);

    acc.push(...buildSlateNode(node, { ...deco, [key]: true }, options));
    return acc;
  }, []);
