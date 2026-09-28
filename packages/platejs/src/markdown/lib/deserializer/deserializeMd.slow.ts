import {
  createTestEditor,
  parseTestMarkdown,
} from '../__tests__/createTestEditor';

describe('editor.api.markdown.parse', () => {
  it('deserializes blockquotes as container blocks with nested list content', () => {
    const editor = createTestEditor();

    expect(
      parseTestMarkdown(
        editor,
        `Hello!
> some thing is reference
> - aaa
> - bbb`
      )
    ).toEqual({
      children: [
        {
          children: [{ text: 'Hello!' }],
          type: 'paragraph',
        },
        {
          children: [
            {
              children: [{ text: 'some thing is reference' }],
              type: 'paragraph',
            },
            {
              children: [{ text: 'aaa' }],
              indent: 1,
              listType: 'bulleted',
              type: 'paragraph',
            },
            {
              children: [{ text: 'bbb' }],
              indent: 1,
              listType: 'bulleted',
              type: 'paragraph',
            },
          ],
          type: 'blockquote',
        },
      ],
    });
  });

  it('deserializes nested blockquotes as nested container blocks', () => {
    const editor = createTestEditor();

    expect(
      parseTestMarkdown(
        editor,
        `> outer
> > inner
> > tail`
      )
    ).toEqual({
      children: [
        {
          children: [
            {
              children: [{ text: 'outer' }],
              type: 'paragraph',
            },
            {
              children: [
                {
                  children: [{ text: 'inner\ntail' }],
                  type: 'paragraph',
                },
              ],
              type: 'blockquote',
            },
          ],
          type: 'blockquote',
        },
      ],
    });
  });

  it('deserializes fenced code blocks directly from raw markdown', () => {
    const editor = createTestEditor();

    expect(
      parseTestMarkdown(editor, '```ts\nconst x = 1;\nconsole.log(x)\n```')
    ).toEqual({
      children: [
        {
          children: [{ text: 'const x = 1;\nconsole.log(x)' }],
          language: 'ts',
          type: 'codeBlock',
        },
      ],
    });
  });

  it('deserializes raw markdown headings across multiple depths', () => {
    const editor = createTestEditor();

    expect(
      parseTestMarkdown(
        editor,
        '# Title\n\n#### Deep title\n\n###### Deepest title'
      )
    ).toEqual({
      children: [
        {
          children: [{ text: 'Title' }],
          level: 1,
          type: 'heading',
        },
        {
          children: [{ text: 'Deep title' }],
          level: 4,
          type: 'heading',
        },
        {
          children: [{ text: 'Deepest title' }],
          level: 6,
          type: 'heading',
        },
      ],
    });
  });

  it('reads a figure holding only an image as an uncaptioned image', () => {
    const editor = createTestEditor();

    expect(
      parseTestMarkdown(
        editor,
        '<figure class="hero"><img src="/image.png"></figure>'
      )
    ).toMatchObject({
      children: [{ type: 'image', url: '/image.png' }],
    });
  });

  it('keeps unregistered raw html as diagnosed source text', () => {
    const editor = createTestEditor();

    expect(
      editor.api.markdown.parse('<div class="hero">\nhello\n</div>', {
        lossPolicy: 'allow',
      })
    ).toMatchObject({
      diagnostics: [
        expect.objectContaining({
          action: 'replaced',
          code: 'markdown-unsupported-node',
          nodeType: 'html',
        }),
      ],
      document: {
        children: [
          {
            children: [{ text: '<div class="hero">\nhello\n</div>' }],
            type: 'paragraph',
          },
        ],
      },
      ok: true,
    });
  });
});
