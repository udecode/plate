import type { TMediaElement } from '../internal/types';
import type { MdMdxJsxFlowElement } from '../mdast';
import type { TRules } from './types';

import { convertNodesSerialize } from '../serializer';
import { parseAttributes, propsToAttributes } from './utils';

function createMediaRule() {
  return {
    deserialize: (node: MdMdxJsxFlowElement): TMediaElement => {
      const props = parseAttributes(node.attributes);

      return {
        children: [{ text: '' }],
        type: node.name!,
        ...props,
      } as TMediaElement;
    },
    serialize: (node: TMediaElement, options: any) => {
      const { id, children, type, ...rest } = node;

      return {
        attributes: propsToAttributes(rest),
        children: convertNodesSerialize(children, options) as any,
        name: type,
        type: 'mdxJsxFlowElement',
      };
    },
  };
}

export const mediaRules: TRules = {
  audio: createMediaRule(),
  file: createMediaRule(),
  video: createMediaRule(),
};
