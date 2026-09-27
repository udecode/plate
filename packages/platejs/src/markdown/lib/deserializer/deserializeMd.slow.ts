import {
  createTestEditor,
  parseTestMarkdown,
} from '../__tests__/createTestEditor';
import {
  markdownToAstProcessorWithRuntime,
  withMarkdownRuntime,
} from '../internal/markdownConversion';
import { MarkdownPlugin } from '../MarkdownPlugin';

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

  it('preserves raw html blocks as editable source text paragraphs', () => {
    const editor = createTestEditor();

    expect(
      parseTestMarkdown(
        editor,
        '<figure class="hero"><img src="/image.png"></figure>'
      )
    ).toEqual({
      children: [
        {
          children: [
            {
              text: '<figure class="hero">\n<img src="/image.png" />\n</figure>',
            },
          ],
          type: 'paragraph',
        },
      ],
    });
  });
});

describe('markdownToAstProcessor', () => {
  it('returns the parsed mdast root', () => {
    const editor = createTestEditor();
    const ast = withMarkdownRuntime(
      editor,
      editor.plugin(MarkdownPlugin).store.get(),
      (runtime) => markdownToAstProcessorWithRuntime(runtime, '# Title')
    );

    expect(ast.type).toBe('root');
    expect(ast.children[0]?.type).toBe('heading');
  });
});
