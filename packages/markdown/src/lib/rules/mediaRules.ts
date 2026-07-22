import type { TMediaElement } from '@platejs/utils';

import type { MdMdxJsxFlowElement } from '../mdast';
import type { MdRules, SerializeMdContext } from '../types';

import { convertNodesSerialize } from '../serializer';
import { isMdFlowContent } from '../serializer/wrapWithBlockId';
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
    serialize: (
      node: TMediaElement,
      options: SerializeMdContext
    ): MdMdxJsxFlowElement => {
      const { children, type, url, ...rest } = node;
      const serializedChildren = convertNodesSerialize(children, options);

      if (!serializedChildren.every(isMdFlowContent)) {
        throw new Error('Media MDX children must be Markdown flow content.');
      }

      return {
        attributes: propsToAttributes({ ...rest, src: url }),
        children: serializedChildren,
        name: type,
        type: 'mdxJsxFlowElement',
      };
    },
  };
}

export const mediaRules = {
  audio: createMediaRule(),
  file: createMediaRule(),
  media_embed: createMediaRule(),
  video: createMediaRule(),
} satisfies MdRules;
