import { KEYS, type TMediaElement } from '@platejs/utils';

import type { MdMdxJsxFlowElement } from '../mdast';
import type {
  DeserializeMdContext,
  MdDecoration,
  MdRules,
  SerializeMdContext,
} from '../types';

import {
  readPlainMarkdownInlineContent,
  serializeUnknownMdxNode,
  toMarkdownCaptionContent,
} from '../internal/markdownDocument';
import { convertChildrenDeserialize } from '../deserializer';
import { convertNodesSerialize } from '../serializer';
import { isMdPhrasingContent } from '../serializer/wrapWithBlockId';
import { parseAttributes, propsToAttributes } from './utils';

function createMediaRule() {
  return {
    deserialize: (
      node: MdMdxJsxFlowElement,
      _deco: MdDecoration,
      options: DeserializeMdContext
    ): TMediaElement => {
      const { src, ...props } = parseAttributes(node.attributes);

      return {
        children: toMarkdownCaptionContent(
          options,
          convertChildrenDeserialize(node.children, {}, options)
        ),
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
      const serializedChildren =
        readPlainMarkdownInlineContent(children) !== ''
          ? convertNodesSerialize(children, options)
          : [];

      if (!serializedChildren.every(isMdPhrasingContent)) {
        throw new Error('Media captions must be Markdown inline content.');
      }

      return {
        attributes: propsToAttributes({ ...rest, src: url }),
        children:
          serializedChildren.length > 0
            ? [{ children: serializedChildren, type: 'paragraph' }]
            : [],
        name: type,
        type: 'mdxJsxFlowElement',
      };
    },
  };
}

const imageFigureRule = {
  deserialize: (
    node: MdMdxJsxFlowElement,
    _deco: MdDecoration,
    options: DeserializeMdContext
  ) => {
    const [image, caption] = node.children;

    if (
      node.children.length !== 2 ||
      image?.type !== 'mdxJsxFlowElement' ||
      image.name !== 'img' ||
      image.children.length > 0 ||
      caption?.type !== 'mdxJsxFlowElement' ||
      caption.name !== 'figcaption'
    ) {
      return {
        children: [{ text: serializeUnknownMdxNode(node) }],
        type: options.getPluginType(KEYS.p),
      };
    }

    const { src, ...properties } = parseAttributes(image.attributes);

    return {
      ...properties,
      children: toMarkdownCaptionContent(
        options,
        convertChildrenDeserialize(caption.children, {}, options)
      ),
      type: options.getPluginType(KEYS.img),
      url: src,
    };
  },
};

export const mediaRules = {
  audio: createMediaRule(),
  file: createMediaRule(),
  figure: imageFigureRule,
  media_embed: createMediaRule(),
  video: createMediaRule(),
} satisfies MdRules;
