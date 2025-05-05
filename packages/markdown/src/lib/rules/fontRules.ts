import kebabCase from 'lodash/kebabCase.js';

import type { MdMdxJsxTextElement } from '../mdast';
import type { TRules } from './types';

import { convertChildrenDeserialize } from '../deserializer';
import { getStyleValue } from '../deserializer/utils/getStyleValue';

function createFontRuleSerialize(propName: string) {
  return function (slateNode: any): MdMdxJsxTextElement {
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
  };
}

function createFontRuleDeserialize(propName: string) {
  const styleName = kebabCase(propName);

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
    deserialize: createFontRuleDeserialize('backgroundColor'),
    mark: true,
    serialize: createFontRuleSerialize('backgroundColor'),
  },
  color: {
    deserialize: createFontRuleDeserialize('color'),
    mark: true,
    serialize: createFontRuleSerialize('color'),
  },
  fontFamily: {
    deserialize: createFontRuleDeserialize('fontFamily'),
    mark: true,
    serialize: createFontRuleSerialize('fontFamily'),
  },
  fontSize: {
    deserialize: createFontRuleDeserialize('fontSize'),
    mark: true,
    serialize: createFontRuleSerialize('fontSize'),
  },
  fontWeight: {
    deserialize: createFontRuleDeserialize('fontWeight'),
    mark: true,
    serialize: createFontRuleSerialize('fontWeight'),
  },
};
