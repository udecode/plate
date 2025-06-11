import type { TMediaElement } from 'platejs';

import type { MdMdxJsxFlowElement } from '../mdast';
import type { MdRules } from '../types';

import { convertNodesSerialize } from '../serializer';
import { parseAttributes, propsToAttributes } from './utils';

function createMediaRule() {
  return {
    deserialize: (node: MdMdxJsxFlowElement): TMediaElement => {
      const { src, ...props } = parseAttributes(node.attributes);

      return {
        children: [{ text: '' }],
        type: node.name!,
        url: src,
        ...props,
      } as TMediaElement;
    },
    serialize: (node: TMediaElement, options: any) => {
      const { id, children, type, url, ...rest } = node;

      return {
        attributes: propsToAttributes({ ...rest, src: url }),
        children: convertNodesSerialize(children, options) as any,
        name: type,
        type: 'mdxJsxFlowElement',
      };
    },
  };
}

export const mediaRules: MdRules = {
  audio: createMediaRule(),
  file: createMediaRule(),
  video: createMediaRule(),
};
