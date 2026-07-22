import type { Descendant } from '@platejs/plite';

import type { MdDelete, MdEmphasis, MdStrong } from '../mdast';
import type { DeserializeMdContext, MdDecoration } from '../types';

import { mdastToPlate } from '../types';
import { buildSlateNode } from './convertNodesDeserialize';

export const convertTextsDeserialize = (
  mdastNode: MdDelete | MdEmphasis | MdStrong,
  deco: MdDecoration,
  options: DeserializeMdContext
) =>
  mdastNode.children.reduce<Descendant[]>((acc, node) => {
    const type = options.getPluginType(mdastToPlate(mdastNode.type));

    acc.push(...buildSlateNode(node, { ...deco, [type]: true }, options));
    return acc;
  }, []);
