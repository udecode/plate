import { createTestEditor } from '../__tests__/createTestEditor';
import {
  deserializeMd,
  markdownToAstProcessor,
  markdownToSlateNodes,
} from './deserializeMd';

describe('deserializeMd', () => {
  it('falls back to the safe markdown path for incomplete mdx tails', () => {
    const editor = createTestEditor();
    const onError = mock();

    expect(deserializeMd(editor, '<u>', { onError: onError as any })).toEqual([
      {
        children: [{ text: '<u>' }],
        type: 'p',
      },
    ]);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('wraps top-level text results from custom rules in paragraphs', () => {
    const editor = createTestEditor();

    expect(
      deserializeMd(editor, 'plain', {
        rules: {
          p: {
            deserialize: () => ({ text: 'wrapped' }),
          },
        } as any,
      })
    ).toEqual([
      {
        children: [{ text: 'wrapped' }],
        type: 'p',
      },
    ]);
  });

  it('returns an empty result and calls onError when withoutMdx is true and parsing fails', () => {
    const editor = createTestEditor();
    const onError = mock();
    const brokenRemarkPlugin = (() => {
      throw new Error('boom');
    }) as any;

    expect(
      deserializeMd(editor, '**bold**', {
        onError: onError as any,
        remarkPlugins: [brokenRemarkPlugin],
        withoutMdx: true,
      })
    ).toEqual([]);
    expect(onError).toHaveBeenCalledTimes(1);
    expect((onError as any).mock.calls[0]?.[0]).toBeInstanceOf(Error);
    expect((onError as any).mock.calls[0]?.[0].message).toBe('boom');
  });

  it('deserializes blockquotes as container blocks with nested list content', () => {
    const editor = createTestEditor();

    expect(
      deserializeMd(
        editor,
        `Hello!
> some thing is reference
> - aaa
> - bbb`
      )
    ).toEqual([
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
    ]);
  });

  it('deserializes nested blockquotes as nested container blocks', () => {
    const editor = createTestEditor();

    expect(
      deserializeMd(
        editor,
        `> outer
> > inner
> > tail`
      )
    ).toEqual([
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
    ]);
  });

  it('deserializes fenced code blocks directly from raw markdown', () => {
    const editor = createTestEditor();

    expect(
      deserializeMd(editor, '```ts\nconst x = 1;\nconsole.log(x)\n```')
    ).toEqual([
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
    ]);
  });

  it('deserializes raw markdown headings across multiple depths', () => {
    const editor = createTestEditor();

    expect(
      deserializeMd(
        editor,
        '# Title\n\n#### Deep title\n\n###### Deepest title'
      )
    ).toEqual([
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
    ]);
  });

  it('preserves raw html blocks as editable source text paragraphs', () => {
    const editor = createTestEditor();

    expect(
      deserializeMd(
        editor,
        '<figure class="hero"><img src="/image.png"></figure>'
      )
    ).toEqual([
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

describe('markdownToAstProcessor', () => {
  it('returns the parsed mdast root', () => {
    const editor = createTestEditor();
    const ast = markdownToAstProcessor(editor, '# Title');

    expect(ast.type).toBe('root');
    expect(ast.children[0]?.type).toBe('heading');
  });
});

describe('markdownToSlateNodes', () => {
  it('preserves explicit space tokens when memoization keeps them', () => {
    const editor = createTestEditor();

    expect(
      markdownToSlateNodes(editor, 'one\n\n\n\ntwo', {
        memoize: true,
        parser: { exclude: [], trim: false },
      })
    ).toEqual([
      {
        _memo: 'one',
        children: [{ text: 'one' }],
        type: 'p',
      },
      {
        _memo: '\n\n\n\n',
        children: [{ text: '' }],
        type: 'p',
      },
      {
        _memo: 'two',
        children: [{ text: 'two' }],
        type: 'p',
      },
    ]);
  });

  it('attaches raw block text to memoized output nodes', () => {
    const editor = createTestEditor();

    expect(
      markdownToSlateNodes(editor, 'one\n\n\ntwo', { memoize: true })
    ).toEqual([
      {
        _memo: 'one',
        children: [{ text: 'one' }],
        type: 'p',
      },
      {
        _memo: 'two',
        children: [{ text: 'two' }],
        type: 'p',
      },
    ]);
  });
});
