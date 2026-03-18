import { parseAttributes, propsToAttributes } from './parseAttributes';

describe('parseAttributes', () => {
  it('parses JSON values and keeps raw strings when parsing fails', () => {
    const attributes = [
      { name: 'count', value: '3' },
      { name: 'enabled', value: 'true' },
      { name: 'config', value: '{"theme":"dark"}' },
      { name: 'label', value: 'plain-text' },
      { name: 'missingValue' },
      { value: 'ignored' },
    ];

    expect(parseAttributes(attributes as any)).toEqual({
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
});
