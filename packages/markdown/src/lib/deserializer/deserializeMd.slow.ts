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
          type: 'p',
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
          type: 'p',
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
          p: {
            deserialize: () => ({ text: 'wrapped' }),
          },
        },
      })
    ).toEqual({
      children: [
        {
          children: [{ text: 'wrapped' }],
          type: 'p',
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
          type: 'p',
        },
        {
          children: [
            {
              children: [{ text: 'some thing is reference' }],
              type: 'p',
            },
            {
              children: [{ text: 'aaa' }],
              indent: 1,
              listStyleType: 'disc',
              type: 'p',
            },
            {
              children: [{ text: 'bbb' }],
              indent: 1,
              listStyleType: 'disc',
              type: 'p',
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
              type: 'p',
            },
            {
              children: [
                {
                  children: [{ text: 'inner\ntail' }],
                  type: 'p',
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
              type: 'code_line',
            },
            {
              children: [{ text: 'console.log(x)' }],
              type: 'code_line',
            },
          ],
          lang: 'ts',
          type: 'code_block',
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
          type: 'h1',
        },
        {
          children: [{ text: 'Deep title' }],
          type: 'h4',
        },
        {
          children: [{ text: 'Deepest title' }],
          type: 'h6',
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
          type: 'p',
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
