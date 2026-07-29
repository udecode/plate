import kebabCase from 'lodash/kebabCase.js';
import type { Text } from '@platejs/plite';

import type { MdMdxJsxTextElement } from '../mdast';
import type { DeserializeMdContext, MdDecoration, MdRules } from '../types';

import { convertChildrenDeserialize } from '../deserializer';

const getStyleValue = (mdastNode: MdMdxJsxTextElement, styleName: string) => {
  const styleAttribute = mdastNode.attributes.find(
    (attribute) =>
      attribute.type === 'mdxJsxAttribute' &&
      attribute.name === 'style' &&
      typeof attribute.value === 'string'
  );

  if (typeof styleAttribute?.value !== 'string') return;

  for (const style of styleAttribute.value.split(';')) {
    const [name, value] = style.split(':').map((part) => part.trim());

    if (name === styleName) return value;
  }
};

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
      options: DeserializeMdContext
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
          ...(backgroundColor !== undefined && { backgroundColor }),
          ...(color !== undefined && { color }),
          ...(fontFamily !== undefined && { fontFamily }),
          ...(fontSize !== undefined && { fontSize }),
          ...(fontWeight !== undefined && { fontWeight }),
        },
        options
      );
    },
  },
} satisfies MdRules;
