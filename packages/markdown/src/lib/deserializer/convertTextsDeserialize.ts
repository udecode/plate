import { getPluginType } from '@platejs/core';
import type { Descendant } from '@platejs/plite';

import type { MdDelete, MdEmphasis, MdStrong } from '../mdast';
import type { MdDecoration } from '../types';
import type { DeserializeMdOptions } from './deserializeMd';

import { mdastToPlate } from '../types';
import { buildSlateNode } from './convertNodesDeserialize';

export const convertTextsDeserialize = (
  mdastNode: MdDelete | MdEmphasis | MdStrong,
  deco: MdDecoration,
  options: DeserializeMdOptions
) =>
  mdastNode.children.reduce<Descendant[]>((acc, node) => {
    const key = mdastToPlate(options.editor!, mdastNode.type);
    const type = getPluginType(options.editor!, key);

    acc.push(...buildSlateNode(node, { ...deco, [type]: true }, options));
    return acc;
  }, []);
