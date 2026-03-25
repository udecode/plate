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
        children: [
          { text: '<Widget>\n' },
          { text: '' },
          { text: '\n</Widget>' },
        ],
        type: 'p',
      },
    ]);
  });
});
