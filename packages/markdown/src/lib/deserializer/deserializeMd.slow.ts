import { createTestEditor } from '../__tests__/createTestEditor';
import { MarkdownPlugin } from '../MarkdownPlugin';
import {
  markdownToAstProcessorWithRuntime,
  withMarkdownRuntime,
} from '../internal/markdownConversion';

describe('editor.api.markdown.deserialize', () => {
  it('falls back to the safe markdown path for incomplete mdx tails', () => {
    const editor = createTestEditor();
    const onError = mock();

    expect(editor.api.markdown.deserialize('<u>', { onError })).toEqual({
      children: [
        {
          children: [{ text: '<u>' }],
          type: 'paragraph',
        },
      ],
    });
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('falls back to editable text for malformed html-like mdx', () => {
    const editor = createTestEditor();
    const onError = mock();

    expect(
      editor.api.markdown.deserialize(String.raw`</ph\><`, {
        onError,
      })
    ).toEqual({
      children: [
        {
          children: [{ text: '</ph><' }],
          type: 'paragraph',
        },
      ],
    });
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('wraps top-level text results from custom rules in paragraphs', () => {
    const editor = createTestEditor();

    expect(
      editor.api.markdown.deserialize('plain', {
        rules: {
          paragraph: {
            deserialize: () => ({ text: 'wrapped' }),
          },
        },
      })
    ).toEqual({
      children: [
        {
          children: [{ text: 'wrapped' }],
          type: 'paragraph',
        },
      ],
    });
  });

  it('returns an empty result and calls onError when withoutMdx is true and parsing fails', () => {
    const editor = createTestEditor();
    const onError = mock();
    const brokenRemarkPlugin = () => {
      throw new Error('boom');
    };

    expect(
      editor.api.markdown.deserialize('**bold**', {
        onError,
        remarkPlugins: [brokenRemarkPlugin],
        withoutMdx: true,
      })
    ).toEqual({ children: [] });
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect(onError.mock.calls[0]?.[0].message).toBe('boom');
  });

  it('deserializes blockquotes as container blocks with nested list content', () => {
    const editor = createTestEditor();

    expect(
      editor.api.markdown.deserialize(
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
      editor.api.markdown.deserialize(
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
      editor.api.markdown.deserialize(
        '```ts\nconst x = 1;\nconsole.log(x)\n```'
      )
    ).toEqual({
      children: [
        {
          children: [
            {
              children: [{ text: 'const x = 1;' }],
              type: 'codeLine',
            },
            {
              children: [{ text: 'console.log(x)' }],
              type: 'codeLine',
            },
          ],
          language: 'ts',
          type: 'codeBlock',
        },
      ],
    });
  });

  it('deserializes raw markdown headings across multiple depths', () => {
    const editor = createTestEditor();

    expect(
      editor.api.markdown.deserialize(
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
      editor.api.markdown.deserialize(
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
