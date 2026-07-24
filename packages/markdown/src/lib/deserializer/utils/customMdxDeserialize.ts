import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx';

import { KEYS } from '@platejs/utils';

import type { DeserializeMdContext, MdDecoration } from '../../types';

import { serializeUnknownMdxNode } from '../../internal/markdownDocument';
import { mdastToPlate } from '../../types';
import { getDeserializerByKey } from './getDeserializerByKey';

export const customMdxDeserialize = (
  mdastNode: MdxJsxFlowElement | MdxJsxTextElement,
  deco: MdDecoration,
  options: DeserializeMdContext
) => {
  const customJsxElementKey = mdastNode.name;

  const key = customJsxElementKey
    ? (options.getPluginKey(customJsxElementKey) ?? customJsxElementKey)
    : null;

  if (key) {
    const nodeParserDeserialize = getDeserializerByKey(
      options.getPluginType(mdastToPlate(key)),
      options
    );

    if (nodeParserDeserialize)
      return nodeParserDeserialize(mdastNode, deco, options);
  } else {
    console.warn(
      'This MDX node does not have a parser for deserialization',
      mdastNode
    );
  }

  // Default fallback: preserve tag structure as text
  if (mdastNode.type === 'mdxJsxTextElement') {
    return [
      {
        text: serializeUnknownMdxNode(mdastNode),
      },
    ];
  }

  if (mdastNode.type === 'mdxJsxFlowElement') {
    return [
      {
        children: [
          {
            text: serializeUnknownMdxNode(mdastNode),
          },
        ],
        type: options.getPluginType(KEYS.p),
      },
    ];
  }

  throw new Error('Unsupported MDX node type.');
};
