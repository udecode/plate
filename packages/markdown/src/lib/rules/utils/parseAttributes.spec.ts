import type {
  MdxJsxAttribute,
  MdxJsxAttributeValueExpression,
  MdxJsxExpressionAttribute,
} from 'mdast-util-mdx';

import { parseAttributes, propsToAttributes } from './parseAttributes';

describe('parseAttributes', () => {
  it('parses JSON values and keeps raw strings when parsing fails', () => {
    const attributes = [
      { name: 'count', type: 'mdxJsxAttribute', value: '3' },
      { name: 'enabled', type: 'mdxJsxAttribute', value: 'true' },
      {
        name: 'config',
        type: 'mdxJsxAttribute',
        value: '{"theme":"dark"}',
      },
      { name: 'label', type: 'mdxJsxAttribute', value: 'plain-text' },
      { name: 'missingValue', type: 'mdxJsxAttribute' },
      { type: 'mdxJsxExpressionAttribute', value: 'ignored' },
    ] satisfies (MdxJsxAttribute | MdxJsxExpressionAttribute)[];

    expect(parseAttributes(attributes)).toEqual({
      config: { theme: 'dark' },
      count: 3,
      enabled: true,
      label: 'plain-text',
    });
  });
});

describe('propsToAttributes', () => {
  it('serializes strings directly and JSON-encodes other values', () => {
    expect(
      propsToAttributes({
        config: { theme: 'dark' },
        count: 3,
        enabled: true,
        label: 'plain-text',
      })
    ).toEqual([
      { name: 'config', type: 'mdxJsxAttribute', value: '{"theme":"dark"}' },
      { name: 'count', type: 'mdxJsxAttribute', value: '3' },
      { name: 'enabled', type: 'mdxJsxAttribute', value: 'true' },
      { name: 'label', type: 'mdxJsxAttribute', value: 'plain-text' },
    ]);
  });

  it('preserves mdx attribute value expressions without stringifying them', () => {
    const expression = {
      data: { estree: { body: [], sourceType: 'module', type: 'Program' } },
      type: 'mdxJsxAttributeValueExpression',
      value: '640',
    } satisfies MdxJsxAttributeValueExpression;

    expect(
      propsToAttributes({
        width: expression,
      })
    ).toEqual([{ name: 'width', type: 'mdxJsxAttribute', value: expression }]);
  });
});
