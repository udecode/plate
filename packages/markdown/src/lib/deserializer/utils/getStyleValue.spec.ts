import type { MdMdxJsxTextElement } from '../../mdast';

import { getStyleValue } from './getStyleValue';

describe('getStyleValue', () => {
  it('should return the value of a style property', () => {
    const mdastNode: MdMdxJsxTextElement = {
      attributes: [
        {
          name: 'style',
          type: 'mdxJsxAttribute',
          value: 'color: #FEFF00; font-size: 16px;',
        },
      ],
      children: [],
      name: 'span',
      type: 'mdxJsxTextElement',
    };

    expect(getStyleValue(mdastNode, 'color')).toBe('#FEFF00');
    expect(getStyleValue(mdastNode, 'font-size')).toBe('16px');
  });

  it('should return undefined if the style property does not exist', () => {
    const mdastNode: MdMdxJsxTextElement = {
      attributes: [
        {
          name: 'style',
          type: 'mdxJsxAttribute',
          value: 'color: #FEFF00;',
        },
      ],
      children: [],
      name: 'span',
      type: 'mdxJsxTextElement',
    };

    expect(getStyleValue(mdastNode, 'font-size')).toBeUndefined();
  });

  it('should return undefined if the style attribute does not exist', () => {
    const mdastNode: MdMdxJsxTextElement = {
      attributes: [
        {
          name: 'class',
          type: 'mdxJsxAttribute',
          value: 'some-class',
        },
      ],
      children: [],
      name: 'span',
      type: 'mdxJsxTextElement',
    };

    expect(getStyleValue(mdastNode, 'color')).toBeUndefined();
  });

  it('should handle multiple style properties correctly', () => {
    const mdastNode: MdMdxJsxTextElement = {
      attributes: [
        {
          name: 'style',
          type: 'mdxJsxAttribute',
          value:
            'background-color: #FE9900; color: #FEFF00; font-weight: bold;',
        },
      ],
      children: [],
      name: 'span',
      type: 'mdxJsxTextElement',
    };

    expect(getStyleValue(mdastNode, 'background-color')).toBe('#FE9900');
    expect(getStyleValue(mdastNode, 'color')).toBe('#FEFF00');
    expect(getStyleValue(mdastNode, 'font-weight')).toBe('bold');
  });
});
