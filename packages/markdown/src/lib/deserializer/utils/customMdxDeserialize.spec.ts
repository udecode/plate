import { createTestEditor } from '../../__tests__/createTestEditor';
import { customMdxDeserialize } from './customMdxDeserialize';

describe('customMdxDeserialize', () => {
  afterEach(() => {
    mock.restore();
  });

  it('uses a registered rule when the mdx tag name matches one', () => {
    const editor = createTestEditor();

    const result = customMdxDeserialize(
      {
        attributes: [
          { name: 'width', type: 'mdxJsxAttribute', value: '50' },
          { name: 'visible', type: 'mdxJsxAttribute', value: 'true' },
        ],
        children: [
          {
            children: [{ type: 'text', value: 'Column content' }],
            type: 'paragraph',
          },
        ],
        name: 'column',
        type: 'mdxJsxFlowElement',
      } as any,
      {},
      { editor }
    );

    expect(result).toEqual({
      children: [
        {
          children: [{ text: 'Column content' }],
          type: 'p',
        },
      ],
      type: 'column',
      visible: true,
      width: 50,
    });
  });

  it('falls back to literal text for unknown inline mdx tags', () => {
    const editor = createTestEditor();

    const result = customMdxDeserialize(
      {
        children: [{ type: 'text', value: 'New' }],
        name: 'Badge',
        type: 'mdxJsxTextElement',
      } as any,
      {},
      { editor }
    );

    expect(result).toEqual([{ text: '<Badge>New</Badge>' }]);
  });

  it('preserves inline mdx attributes in the fallback source text', () => {
    const editor = createTestEditor();

    const result = customMdxDeserialize(
      {
        attributes: [
          { name: 'htmlFor', type: 'mdxJsxAttribute', value: 'email' },
        ],
        children: [{ type: 'text', value: 'Email' }],
        name: 'label',
        type: 'mdxJsxTextElement',
      } as any,
      {},
      { editor }
    );

    expect(result).toEqual([{ text: '<label for="email">Email</label>' }]);
  });

  it('warns and falls back when the inline mdx tag name is empty', () => {
    const editor = createTestEditor();
    const warn = spyOn(console, 'warn').mockImplementation(() => {});

    const result = customMdxDeserialize(
      {
        children: [{ type: 'text', value: 'New' }],
        name: '',
        type: 'mdxJsxTextElement',
      } as any,
      {},
      { editor }
    );

    expect(warn).toHaveBeenCalledWith(
      'This MDX node does not have a parser for deserialization',
      expect.objectContaining({
        name: '',
        type: 'mdxJsxTextElement',
      })
    );
    expect(result).toEqual([{ text: '<>New</>' }]);
  });

  it('falls back to a paragraph wrapper for unknown block mdx tags', () => {
    const editor = createTestEditor();

    const result = customMdxDeserialize(
      {
        children: [],
        name: 'Widget',
        type: 'mdxJsxFlowElement',
      } as any,
      {},
      { editor }
    );

    expect(result).toEqual([
      {
        children: [{ text: '<Widget />' }],
        type: 'p',
      },
    ]);
  });

  it('preserves block mdx attributes and nested unknown tags as source text', () => {
    const editor = createTestEditor();

    const result = customMdxDeserialize(
      {
        attributes: [
          { name: 'className', type: 'mdxJsxAttribute', value: 'hero' },
        ],
        children: [
          {
            attributes: [
              { name: 'src', type: 'mdxJsxAttribute', value: '/image.png' },
            ],
            children: [],
            name: 'img',
            type: 'mdxJsxFlowElement',
          },
        ],
        name: 'figure',
        type: 'mdxJsxFlowElement',
      } as any,
      {},
      { editor }
    );

    expect(result).toEqual([
      {
        children: [
          {
            text: '<figure class="hero">\n<img src="/image.png" />\n</figure>',
          },
        ],
        type: 'p',
      },
    ]);
  });
});
