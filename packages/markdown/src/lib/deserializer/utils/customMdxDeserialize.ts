import type { MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx';

import { getPluginType, KEYS } from 'platejs';

import type { MdDecoration } from '../../types';
import type { DeserializeMdOptions } from '../deserializeMd';

import { mdastToPlate } from '../../types';
import { convertChildrenDeserialize } from '../convertChildrenDeserialize';
import { getDeserializerByKey } from './getDeserializerByKey';

export const customMdxDeserialize = (
  mdastNode: MdxJsxFlowElement | MdxJsxTextElement,
  deco: MdDecoration,
  options: DeserializeMdOptions
) => {
  const customJsxElementKey = mdastNode.name;

  if (customJsxElementKey) {
    const nodeParserDeserialize = getDeserializerByKey(
      mdastToPlate(options.editor!, customJsxElementKey as any),
      options
    );

    if (nodeParserDeserialize)
      return nodeParserDeserialize(mdastNode, deco, options) as any;
  } else {
    console.warn(
      'This MDX node does not have a parser for deserialization',
      mdastNode
    );
  }

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
        type: getPluginType(options.editor!, KEYS.p),
      },
    ];
  }
};
