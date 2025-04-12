import type { MdDelete, MdEmphasis, MdStrong } from '../mdast';
import type { DeserializeMdOptions } from './deserializeMd';
import type { Decoration } from './type';

import { getPlateNodeType } from '../utils';
import { buildSlateNode } from './convertNodesDeserialize';

export const convertTextsDeserialize = (
  mdastNode: MdDelete | MdEmphasis | MdStrong,
  deco: Decoration,
  options: DeserializeMdOptions
) => {
  return mdastNode.children.reduce((acc: any, n: any) => {
    acc.push(
      ...buildSlateNode(
        n,
        { ...deco, [getPlateNodeType(mdastNode.type)]: true },
        options
      )
    );
    return acc;
  }, []);
};
