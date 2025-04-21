import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx';

import type { DeserializeMdOptions } from '../deserializeMd';
import type { Decoration } from '../type';

import { convertChildrenDeserialize } from '../convertChildrenDeserialize';
import { getDeserializerByKey } from './getDeserializerByKey';

export const customMdxDeserialize = (
  mdastNode: MdxJsxFlowElement | MdxJsxTextElement,
  deco: Decoration,
  options: DeserializeMdOptions
) => {
  /** Handle custom mdx nodes */
  if (mdastNode.name === 'br') {
    const parserKey = mdastNode.name;
    const nodeParserDeserialize = getDeserializerByKey(parserKey, options);

    if (nodeParserDeserialize)
      return nodeParserDeserialize(mdastNode, deco, options);

    return [{ text: '\n' }];
  }

  if (mdastNode.name === 'u') {
    const parserKey = 'underline';

    const nodeParserDeserialize = getDeserializerByKey(parserKey, options);

    if (nodeParserDeserialize)
      return nodeParserDeserialize(mdastNode, deco, options) as any;
  }

  const customJsxElementKey = mdastNode.name;

  if (customJsxElementKey) {
    const nodeParserDeserialize = getDeserializerByKey(
      customJsxElementKey,
      options
    );

    if (nodeParserDeserialize)
      return nodeParserDeserialize(mdastNode, deco, options) as any;
  }

  console.warn(
    'This MDX node does not have a parser for deserialization',
    mdastNode
  );

  // Default fallback: preserve tag structure as text
  if (mdastNode.type === 'mdxJsxTextElement') {
    const tagName = mdastNode.name;
    let textContent = '';

    if (mdastNode.children) {
      textContent = mdastNode.children
        .map((child) => {
          if ('value' in child) return child.value;
          return '';
        })
        .join('');
    }

    return [
      {
        text: `<${tagName}>${textContent}</${tagName}>`,
      },
    ];
  }

  if (mdastNode.type === 'mdxJsxFlowElement') {
    const tagName = mdastNode.name;

    // Return as a paragraph with the tag structure preserved
    return [
      {
        children: [
          {
            text: `<${tagName}>\n`,
          },
          ...convertChildrenDeserialize(mdastNode.children, deco, options),
          {
            text: `\n</${tagName}>`,
          },
        ],
        type: 'p',
      },
    ];
  }
};
