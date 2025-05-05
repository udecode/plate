import type { MdMdxJsxTextElement } from '../mdast';
import type { TRules } from './types';

import { convertChildrenDeserialize } from '../deserializer';
import { getStyleValue } from '../deserializer/utils/getStyleValue';

function createFontRuleSerialize(styleName: string, propName: string) {
  return function (slateNode: any): MdMdxJsxTextElement {
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
  };
}

function createFontRuleDeserialize(styleName: string, propName: string) {
  return function (mdastNode: MdMdxJsxTextElement, deco: any, options: any) {
    const value = getStyleValue(mdastNode, styleName);
    return convertChildrenDeserialize(
      mdastNode.children,
      { [propName]: value, ...deco },
      options
    ) as any;
  };
}

export const fontRules: TRules = {
  backgroundColor: {
    deserialize: createFontRuleDeserialize(
      'background-color',
      'backgroundColor'
    ),
    mark: true,
    serialize: createFontRuleSerialize('background-color', 'backgroundColor'),
  },
  color: {
    deserialize: createFontRuleDeserialize('color', 'color'),
    mark: true,
    serialize: createFontRuleSerialize('color', 'color'),
  },
  fontFamily: {
    deserialize: createFontRuleDeserialize('font-family', 'fontFamily'),
    mark: true,
    serialize: createFontRuleSerialize('font-family', 'fontFamily'),
  },
  fontSize: {
    deserialize: createFontRuleDeserialize('font-size', 'fontSize'),
    mark: true,
    serialize: createFontRuleSerialize('font-size', 'fontSize'),
  },
  fontWeight: {
    deserialize: createFontRuleDeserialize('font-weight', 'fontWeight'),
    mark: true,
    serialize: createFontRuleSerialize('font-weight', 'fontWeight'),
  },
};
