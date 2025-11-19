import kebabCase from 'lodash/kebabCase.js';

import type { MdMdxJsxTextElement } from '../mdast';
import type { MdRules } from '../types';

import { convertChildrenDeserialize, getStyleValue } from '../deserializer';

function createFontRule(propName: string) {
  const styleName = kebabCase(propName);

  return {
    mark: true,
    serialize: (slateNode: any): MdMdxJsxTextElement => ({
      attributes: [
        {
          name: 'style',
          type: 'mdxJsxAttribute',
          value: `${styleName}: ${slateNode[propName]};`,
        },
      ],
      children: [{ type: 'text', value: slateNode.text }],
      name: 'span',
      type: 'mdxJsxTextElement',
    }),
  };
}

export const fontRules: MdRules = {
  backgroundColor: createFontRule('backgroundColor'),
  color: createFontRule('color'),
  fontFamily: createFontRule('fontFamily'),
  fontSize: createFontRule('fontSize'),
  fontWeight: createFontRule('fontWeight'),
  span: {
    mark: true,
    deserialize: (mdastNode: MdMdxJsxTextElement, deco: any, options: any) => {
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
      ) as any;
    },
  },
};
