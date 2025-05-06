import kebabCase from 'lodash/kebabCase.js';

import type { MdMdxJsxTextElement } from '../mdast';
import type { TRules } from './types';

import { convertChildrenDeserialize, getStyleValue } from '../deserializer';

function createFontRule(propName: string) {
  const styleName = kebabCase(propName);

  return {
    mark: true,
    deserialize: (mdastNode: MdMdxJsxTextElement, deco: any, options: any) => {
      const value = getStyleValue(mdastNode, styleName);
      return convertChildrenDeserialize(
        mdastNode.children,
        { [propName]: value, ...deco },
        options
      ) as any;
    },
    serialize: (slateNode: any): MdMdxJsxTextElement => {
      const styleName = kebabCase(propName);
      return {
        attributes: [
          {
            name: 'style',
            type: 'mdxJsxAttribute',
            value: `${styleName}: ${slateNode[propName]};`,
          },
        ],
        children: [{ type: 'text', value: slateNode.text }],
        name: propName,
        type: 'mdxJsxTextElement',
      };
    },
  };
}

export const fontRules: TRules = {
  backgroundColor: createFontRule('backgroundColor'),
  color: createFontRule('color'),
  fontFamily: createFontRule('fontFamily'),
  fontSize: createFontRule('fontSize'),
  fontWeight: createFontRule('fontWeight'),
};
