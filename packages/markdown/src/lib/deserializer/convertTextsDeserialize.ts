import type { MdDelete, MdEmphasis, MdStrong } from '../mdast';
import type { MdDecoration } from '../types';
import type { DeserializeMdOptions } from './deserializeMd';

import { mdastToPlate } from '../types';
import { buildSlateNode } from './convertNodesDeserialize';

export const convertTextsDeserialize = (
  mdastNode: MdDelete | MdEmphasis | MdStrong,
  deco: MdDecoration,
  options: DeserializeMdOptions
) => {
  return mdastNode.children.reduce((acc: any, n: any) => {
    acc.push(
      ...buildSlateNode(
        n,
        { ...deco, [mdastToPlate(options.editor!, mdastNode.type)]: true },
        options
      )
    );
    return acc;
  }, []);
};
