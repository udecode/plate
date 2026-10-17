import type { Value } from 'platejs';

import { createTestEditor } from '../__tests__/createTestEditor';
import {
  deserializeMd,
  markdownToAstProcessor,
  markdownToSlateNodes,
} from './deserializeMd';
import { serializeMd } from '../serializer/serializeMd';

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

  it('falls back to editable text for malformed html-like mdx', () => {
    const editor = createTestEditor();
    const onError = mock();

    expect(
      deserializeMd(editor, String.raw`</ph\><`, {
        onError: onError as any,
      })
    ).toEqual([
      {
        children: [{ text: '</ph><' }],
        type: 'p',
      },
    ]);
    expect(onError).toHaveBeenCalledTimes(1);
  });

  it('keeps the rest of the document after an email autolink with remark-mdx', () => {
    const editor = createTestEditor();
    const errors: Error[] = [];
    const markdown = [
      '## Alert',
      '- User: <quinn.martin@mindflow.io>',
      '',
      '## MITRE ATT&CK',
      '| Tactic | Technique ID |',
      '| --- | --- |',
      '| Initial Access | T1078.004 |',
      '',
      '## Analysis Update',
      '**Judgment:** HIGH',
    ].join('\n');

    const value = deserializeMd(editor, markdown, {
      onError: (error) => {
        errors.push(error);
      },
    });

    expect(errors).toEqual([]);
    expect(value).toEqual([
      { type: 'h2', children: [{ text: 'Alert' }] },
      {
        type: 'p',
        indent: 1,
        listStyleType: 'disc',
        children: [
          { text: 'User: ' },
          {
            type: 'a',
            url: 'mailto:quinn.martin@mindflow.io',
            children: [{ text: 'quinn.martin@mindflow.io' }],
          },
        ],
      },
      { type: 'h2', children: [{ text: 'MITRE ATT&CK' }] },
      {
        type: 'table',
        children: [
          {
            type: 'tr',
            children: [
              {
                type: 'th',
                children: [{ type: 'p', children: [{ text: 'Tactic' }] }],
              },
              {
                type: 'th',
                children: [{ type: 'p', children: [{ text: 'Technique ID' }] }],
              },
            ],
          },
          {
            type: 'tr',
            children: [
              {
                type: 'td',
                children: [
                  { type: 'p', children: [{ text: 'Initial Access' }] },
                ],
              },
              {
                type: 'td',
                children: [{ type: 'p', children: [{ text: 'T1078.004' }] }],
              },
            ],
          },
        ],
      },
      { type: 'h2', children: [{ text: 'Analysis Update' }] },
      {
        type: 'p',
        children: [{ text: 'Judgment:', bold: true }, { text: ' HIGH' }],
      },
    ]);
  });

  it('parses autolinks with remark-mdx the same way as without it', () => {
    const editor = createTestEditor();
    const markdown =
      'Mail <quinn.martin@mindflow.io>, see <https://example.com/_a_(b)?x=1&y=2> or <mailto:a@b.co>, not `<c@d.co>`';

    const value = deserializeMd(editor, markdown);
    expect(value).toEqual([
      {
        type: 'p',
        children: [
          { text: 'Mail ' },
          {
            type: 'a',
            url: 'mailto:quinn.martin@mindflow.io',
            children: [{ text: 'quinn.martin@mindflow.io' }],
          },
          { text: ', see ' },
          {
            type: 'a',
            url: 'https://example.com/_a_(b)?x=1&y=2',
            children: [{ text: 'https://example.com/_a_(b)?x=1&y=2' }],
          },
          { text: ' or ' },
          {
            type: 'a',
            url: 'mailto:a@b.co',
            children: [{ text: 'mailto:a@b.co' }],
          },
          { text: ', not ' },
          { text: '<c@d.co>', code: true },
        ],
      },
    ]);
    expect(value).toEqual(
      deserializeMd(editor, markdown, { withoutMdx: true })
    );
  });

  it('round-trips links that serialize as autolinks with remark-mdx', () => {
    const editor = createTestEditor();
    const value: Value = [
      {
        children: [
          { text: 'Contact ' },
          {
            children: [{ text: 'quinn.martin@mindflow.io' }],
            type: 'a',
            url: 'mailto:quinn.martin@mindflow.io',
          },
          { text: ' today' },
        ],
        type: 'p',
      },
      { children: [{ text: 'after' }], type: 'p' },
    ];

    const markdown = serializeMd(editor, { value });

    expect(markdown).toContain('<quinn.martin@mindflow.io>');
    expect(deserializeMd(editor, markdown)).toEqual(value);
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

  it('removes inline html elements whose deserialize rule key is disallowed', () => {
    const editor = createTestEditor();

    expect(
      deserializeMd(
        editor,
        'a<br/>b <u>c</u> <a href="https://platejs.org">d</a>',
        { disallowedNodes: ['underline'] }
      )
    ).toEqual([
      {
        children: [
          { text: 'a' },
          { text: '\n' },
          { text: 'b ' },
          { text: ' ' },
          {
            children: [{ text: 'd' }],
            type: 'a',
            url: 'https://platejs.org',
          },
        ],
        type: 'p',
      },
    ]);
  });

  it('applies disallowedNodes to the children of bold, italic and strikethrough', () => {
    const editor = createTestEditor();

    expect(
      deserializeMd(
        editor,
        'x **[b](https://platejs.org)** _[i](https://platejs.org)_ ~~[s](https://platejs.org)~~ and [m](https://platejs.org)',
        { disallowedNodes: ['a'] }
      )
    ).toEqual([
      {
        children: [
          { text: 'x ' },
          { text: ' ' },
          { text: ' ' },
          { text: ' and ' },
        ],
        type: 'p',
      },
    ]);
  });

  it('applies allowedNodes to the children of bold, italic and strikethrough', () => {
    const editor = createTestEditor();

    expect(
      deserializeMd(
        editor,
        'x **[b](https://platejs.org) c** _[i](https://platejs.org)_ ~~[s](https://platejs.org)~~',
        { allowedNodes: ['p', 'text', 'bold', 'italic', 'strikethrough'] }
      )
    ).toEqual([
      {
        children: [
          { text: 'x ' },
          { bold: true, text: ' c' },
          { text: ' ' },
          { text: ' ' },
        ],
        type: 'p',
      },
    ]);
  });

  it('applies allowNode to the children of bold, italic and strikethrough', () => {
    const editor = createTestEditor();

    expect(
      deserializeMd(
        editor,
        'x **[b](https://platejs.org)** _[i](https://platejs.org)_ ~~[s](https://platejs.org)~~',
        { allowNode: { deserialize: (node) => node.type !== 'a' } }
      )
    ).toEqual([
      {
        children: [{ text: 'x ' }, { text: ' ' }, { text: ' ' }],
        type: 'p',
      },
    ]);
  });

  it('keeps inline html under an allowlist that admits mdxJsxTextElement', () => {
    const editor = createTestEditor();

    expect(
      deserializeMd(editor, 'a<br/>b <u>c</u>', {
        allowedNodes: ['p', 'text', 'mdxJsxTextElement'],
      })
    ).toEqual([
      {
        children: [
          { text: 'a' },
          { text: '\n' },
          { text: 'b ' },
          { text: 'c', underline: true },
        ],
        type: 'p',
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
