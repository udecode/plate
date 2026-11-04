import { getPluginType } from 'platejs';

import type { MdDelete, MdEmphasis, MdStrong } from '../mdast';
import type { MdDecoration } from '../types';
import type { DeserializeMdOptions } from './deserializeMd';

import { mdastToPlate } from '../types';
import { buildSlateNode } from './convertNodesDeserialize';
import { dropNewlineAfterBr } from './internal/dropNewlineAfterBr';
import { shouldDeserializeNode } from './internal/shouldDeserializeNode';

export const convertTextsDeserialize = (
  mdastNode: MdDelete | MdEmphasis | MdStrong,
  deco: MdDecoration,
  options: DeserializeMdOptions
) =>
  mdastNode.children.reduce((acc: any, n: any, index) => {
    const key = mdastToPlate(options.editor!, mdastNode.type);
    const type = getPluginType(options.editor!, key);

    if (shouldDeserializeNode(n, options)) {
      const current = dropNewlineAfterBr(n, mdastNode.children[index - 1]);

      acc.push(...buildSlateNode(current, { ...deco, [type]: true }, options));
    }
    return acc;
  }, []);
