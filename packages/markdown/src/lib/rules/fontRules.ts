import kebabCase from 'lodash/kebabCase.js';
import type { Text } from '@platejs/plite';

import type { MdMdxJsxTextElement } from '../mdast';
import type { MdRules } from '../types';
import type { MdDecoration } from '../types';
import type { DeserializeMdOptions } from '../deserializer';

import { convertChildrenDeserialize, getStyleValue } from '../deserializer';

function createFontRule(propName: string) {
  const styleName = kebabCase(propName);

  return {
    mark: true,
    serialize: (slateNode: Text): MdMdxJsxTextElement => ({
      attributes: [
        {
          name: 'style',
          type: 'mdxJsxAttribute',
          value: `${styleName}: ${String(slateNode[propName])};`,
        },
      ],
      children: [{ type: 'text', value: slateNode.text }],
      name: 'span',
      type: 'mdxJsxTextElement',
    }),
  };
}

export const fontRules = {
  backgroundColor: createFontRule('backgroundColor'),
  color: createFontRule('color'),
  fontFamily: createFontRule('fontFamily'),
  fontSize: createFontRule('fontSize'),
  fontWeight: createFontRule('fontWeight'),
  span: {
    mark: true,
    deserialize: (
      mdastNode: MdMdxJsxTextElement,
      deco: MdDecoration,
      options: DeserializeMdOptions
    ) => {
      const fontFamily = getStyleValue(mdastNode, 'font-family');
      const fontSize = getStyleValue(mdastNode, 'font-size');
      const fontWeight = getStyleValue(mdastNode, 'font-weight');
      const color = getStyleValue(mdastNode, 'color');
      const backgroundColor = getStyleValue(mdastNode, 'background-color');

      return convertChildrenDeserialize(
        mdastNode.children,
        {
          ...deco,
          backgroundColor,
          color,
          fontFamily,
          fontSize,
          fontWeight,
        },
        options
      );
    },
  },
} satisfies MdRules;
