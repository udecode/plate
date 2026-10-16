import type { Plugin, Processor } from 'unified';

import baseRemarkMdx from 'remark-mdx';
import { fromMarkdown } from 'mdast-util-from-markdown';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import { unified } from 'unified';
import { remarkMdx } from '../plugins/remarkMdx';

import { createTestEditor } from '../__tests__/createTestEditor';
import { deserializeMd, markdownToAstProcessor } from './deserializeMd';

const editor = createTestEditor();

it('keeps JSX after a pending list exit', () => {
  const input = '- item\n\n<u{/*@example.com>*/...a\n> b}>keep</u>';
  expect(markdownToAstProcessor(editor, input)).toEqual(
    unified().use(remarkParse).use(baseRemarkMdx).parse(input)
  );
});

it('preserves inherited native construct flags', () => {
  function inheritFlow(this: Processor) {
    const extension = this.data().micromarkExtensions!.at(-1)!;
    const constructs = [extension.flow![60]].flat();
    extension.flow![60] = constructs
      .filter((construct) => Boolean(construct))
      .map((construct) => Object.create(construct!));
  }
  const input = '<A title="\n> x\n" />\n\n<u>keep</u>';
  expect(
    markdownToAstProcessor(editor, input, {
      remarkPlugins: [remarkMdx, inheritFlow],
    })
  ).toEqual(
    unified().use(remarkParse).use(baseRemarkMdx).use(inheritFlow).parse(input)
  );
});

it('accepts frozen native extensions', () => {
  function freezeExtensions(this: Processor) {
    for (const extension of this.data().micromarkExtensions ?? [])
      Object.freeze(extension);
  }
  const input = '<u>keep</u>';
  expect(
    markdownToAstProcessor(editor, input, {
      remarkPlugins: [remarkMdx, freezeExtensions],
    })
  ).toEqual(
    unified()
      .use(remarkParse)
      .use(baseRemarkMdx)
      .use(freezeExtensions)
      .parse(input)
  );
});

it('preserves native grammar getter receivers', () => {
  function nativeGetter(this: Processor) {
    for (const construct of [
      this.data().micromarkExtensions!.at(-1)!.flow![60],
    ].flat()) {
      if (!construct) continue;
      Object.defineProperty(construct, 'concrete', {
        enumerable: true,
        configurable: true,
        get() {
          return this === construct;
        },
      });
    }
  }
  const input = '<A title="\n> x\n" />\n\n<u>keep</u>';
  expect(
    markdownToAstProcessor(editor, input, {
      remarkPlugins: [remarkMdx, nativeGetter],
    })
  ).toEqual(
    unified().use(remarkParse).use(baseRemarkMdx).use(nativeGetter).parse(input)
  );
});

it('normalizes later HTML after failed quoted code inside JSX', () => {
  expect(
    deserializeMd(
      editor,
      '<div>\n`<Foo title=">`\n\ntext<br>after\n\n</div>\n\n<u>keep</u>'
    )
  ).toEqual([
    {
      type: 'p',
      children: [
        {
          rawHtml: true,
          text: '<div>\n`<Foo title=">`\ntext<br />after\n</div>',
        },
      ],
    },
    { type: 'p', children: [{ text: 'keep', underline: true }] },
  ]);
});

it('does not inspect unrelated processor data while parsing', () => {
  function unrelatedData(this: Processor) {
    Object.defineProperty(this.data(), 'unrelated', {
      enumerable: true,
      get() {
        throw new Error('Unrelated processor data was read');
      },
    });
  }
  const input = '<u>keep</u>';
  expect(
    markdownToAstProcessor(editor, input, {
      remarkPlugins: [remarkMdx, unrelatedData],
    })
  ).toEqual(
    unified()
      .use(remarkParse)
      .use(baseRemarkMdx)
      .use(unrelatedData)
      .parse(input)
  );
});

it('uses configured math ownership before later JSX', () => {
  const input =
    '$$\n~~~\n$$\n\n> <u{/*@example.com>\n> */...a\n> > b}>keep</u>';
  expect(
    markdownToAstProcessor(editor, input, {
      remarkPlugins: [remarkMdx, remarkMath],
    })
  ).toEqual(
    unified().use(remarkParse).use(baseRemarkMdx).use(remarkMath).parse(input)
  );
});

it('retains attached native roles after construct names change', () => {
  function rename(this: Processor) {
    const extension = this.data().micromarkExtensions!.at(-1)!;
    for (const record of [extension.text, extension.flow])
      for (const value of Object.values(record!))
        for (const construct of [value].flat())
          if (construct) construct.name = `application${construct.name}`;
  }
  expect(
    deserializeMd(editor, '<a@example.com>\n\n<u>keep</u>', {
      remarkPlugins: [remarkMdx, rename],
    })
  ).toEqual([
    {
      type: 'p',
      children: [
        {
          type: 'a',
          url: 'mailto:a@example.com',
          children: [{ text: 'a@example.com' }],
        },
      ],
    },
    { type: 'p', children: [{ text: 'keep', underline: true }] },
  ]);
});

it('respects replacement tokenizers on attached constructs', () => {
  function replace(this: Processor) {
    const extension = this.data().micromarkExtensions!.at(-1)!;
    for (const value of [extension.text![60], extension.flow![60]])
      for (const construct of [value].flat())
        if (construct) construct.tokenize = (_effects, _ok, nok) => nok;
  }
  const input = '<a@example.com>\n\n<u>keep</u>';
  expect(
    markdownToAstProcessor(editor, input, {
      remarkPlugins: [remarkMdx, replace],
    })
  ).toEqual(
    unified().use(remarkParse).use(baseRemarkMdx).use(replace).parse(input)
  );
});

it('keeps source ownership when nested parsing reuses live constructs', () => {
  function nested(this: Processor) {
    const data = this.data();
    let entered = false;
    data.micromarkExtensions!.push({
      text: {
        33: {
          name: 'nestedMarkdown',
          tokenize(_effects, _ok, nok) {
            if (!entered) {
              entered = true;
              fromMarkdown('pppppppppppppp<u>inner</u>', {
                extensions: [this.parser.constructs],
                mdastExtensions: data.fromMarkdownExtensions,
              });
            }
            return nok;
          },
        },
      },
    });
  }
  const input = '! <Foo title="<ignore@example.com>" /><u>outer</u>';
  expect(
    markdownToAstProcessor(editor, input, {
      remarkPlugins: [remarkMdx, nested],
    })
  ).toEqual(
    unified().use(remarkParse).use(baseRemarkMdx).use(nested).parse(input)
  );
});

it('preserves angle-wrapped link destinations', () => {
  expect(deserializeMd(editor, '[link](<https://example.com>)')).toEqual([
    {
      type: 'p',
      children: [
        { type: 'a', url: 'https://example.com', children: [{ text: 'link' }] },
      ],
    },
  ]);
});

it('preserves angle-wrapped image destinations', () => {
  expect(
    deserializeMd(editor, '![image](<https://example.com/image.png>)')
  ).toEqual([
    {
      caption: [{ text: 'image' }],
      children: [{ text: '' }],
      type: 'img',
      url: 'https://example.com/image.png',
    },
  ]);
});

it('preserves email-like text in JSX attributes', () => {
  expect(
    deserializeMd(editor, 'Before <Foo label="<user@example.com>" /> after')
  ).toEqual([
    {
      type: 'p',
      children: [
        { text: 'Before ' },
        { rawHtml: true, text: '<Foo label="<user@example.com>" />' },
        { text: ' after' },
      ],
    },
  ]);
});

it.each([
  'svg:rect',
  'mailto:widget',
  'MAILTO:widget',
])('preserves the JSX namespace %s', (name) => {
  expect(deserializeMd(editor, `<${name}>label</${name}>\n\nAfter`)).toEqual([
    {
      type: 'p',
      children: [{ rawHtml: true, text: `<${name}>label</${name}>` }],
    },
    { type: 'p', children: [{ text: 'After' }] },
  ]);
});

it('parses standalone autolinks through the AST entry point with direct remark-mdx', () => {
  const ast = markdownToAstProcessor(editor, '<user@example.com>\n\nAfter', {
    remarkPlugins: [baseRemarkMdx],
  });
  expect(ast.children).toMatchObject([
    {
      type: 'paragraph',
      children: [
        {
          type: 'link',
          url: 'mailto:user@example.com',
          children: [{ type: 'text', value: 'user@example.com' }],
        },
      ],
    },
    { type: 'paragraph', children: [{ type: 'text', value: 'After' }] },
  ]);
});

it('parses an autolink adjacent to JSX without losing later content', () => {
  const ast = markdownToAstProcessor(
    editor,
    '<u><user@example.com></u>\n\nAfter'
  );
  expect(ast.children).toMatchObject([
    {
      type: 'paragraph',
      children: [
        {
          type: 'mdxJsxTextElement',
          name: 'u',
          children: [
            {
              type: 'link',
              url: 'mailto:user@example.com',
              children: [{ type: 'text', value: 'user@example.com' }],
            },
          ],
        },
      ],
    },
    { type: 'paragraph', children: [{ type: 'text', value: 'After' }] },
  ]);
});

it('removes direct remark-mdx when withoutMdx is requested', () => {
  const ast = markdownToAstProcessor(editor, '<u>under</u>', {
    remarkPlugins: [baseRemarkMdx],
    withoutMdx: true,
  });
  expect(ast.children).toMatchObject([
    {
      type: 'paragraph',
      children: [
        { type: 'html', value: '<u>' },
        { type: 'text', value: 'under' },
        { type: 'html', value: '</u>' },
      ],
    },
  ]);
});

it('keeps the document and MDX marks after an email beginning with a void tag name', () => {
  const errors: Error[] = [];
  const onError = (error: Error) => {
    errors.push(error);
  };
  const value = deserializeMd(
    editor,
    '<input@example.com>\n\n## After\n\n<u>keep underline</u>',
    { onError }
  );
  expect(value).toEqual([
    {
      type: 'p',
      children: [
        {
          type: 'a',
          url: 'mailto:input@example.com',
          children: [{ text: 'input@example.com' }],
        },
      ],
    },
    { type: 'h2', children: [{ text: 'After' }] },
    { type: 'p', children: [{ text: 'keep underline', underline: true }] },
  ]);
  expect(errors).toEqual([]);
});

it('accepts native email local parts that resemble MDX expressions', () => {
  const input = '<first{last}@example.com>\n\n## After';
  expect(deserializeMd(editor, input)).toEqual([
    {
      type: 'p',
      children: [
        {
          type: 'a',
          url: 'mailto:first{last}@example.com',
          children: [{ text: 'first{last}@example.com' }],
        },
      ],
    },
    { type: 'h2', children: [{ text: 'After' }] },
  ]);
  expect(markdownToAstProcessor(editor, input).children).toMatchObject([
    {
      type: 'paragraph',
      children: [
        {
          type: 'link',
          url: 'mailto:first{last}@example.com',
          children: [{ type: 'text', value: 'first{last}@example.com' }],
        },
      ],
    },
    { type: 'heading', depth: 2, children: [{ type: 'text', value: 'After' }] },
  ]);
});

it('keeps later blockquotes and lists after an email with an unmatched brace', () => {
  const ast = markdownToAstProcessor(
    editor,
    '<a{@example.com>\n\n> quoted\n\n- item'
  );
  expect(ast.children).toMatchObject([
    {
      type: 'paragraph',
      children: [
        {
          type: 'link',
          url: 'mailto:a{@example.com',
          children: [{ type: 'text', value: 'a{@example.com' }],
        },
      ],
    },
    {
      type: 'blockquote',
      children: [
        { type: 'paragraph', children: [{ type: 'text', value: 'quoted' }] },
      ],
    },
    {
      type: 'list',
      ordered: false,
      children: [
        {
          type: 'listItem',
          children: [
            { type: 'paragraph', children: [{ type: 'text', value: 'item' }] },
          ],
        },
      ],
    },
  ]);
});

it('keeps a lazy blockquote continuation after a brace email', () => {
  const ast = markdownToAstProcessor(editor, '> <a{@example.com>\ncontinued');
  expect(ast.children).toMatchObject([
    {
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'link',
              url: 'mailto:a{@example.com',
              children: [{ type: 'text', value: 'a{@example.com' }],
            },
            { type: 'text', value: '\ncontinued' },
          ],
        },
      ],
    },
  ]);
});

it('keeps a complete JSX expression when its string also resembles an email autolink', () => {
  const ast = markdownToAstProcessor(
    editor,
    "<A{...'u@example.com>text'}>label</A>"
  );
  expect(ast.children).toMatchObject([
    {
      type: 'paragraph',
      children: [
        {
          type: 'mdxJsxTextElement',
          name: 'A',
          attributes: [
            {
              type: 'mdxJsxExpressionAttribute',
              value: "...'u@example.com>text'",
            },
          ],
          children: [{ type: 'text', value: 'label' }],
        },
      ],
    },
  ]);
});

it('keeps multiline JSX and an adjacent email inside the original blockquote', () => {
  const ast = markdownToAstProcessor(
    editor,
    '> <u\n> ><user@example.com></u>\n\nAfter'
  );
  expect(ast.children).toMatchObject([
    {
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'mdxJsxTextElement',
              name: 'u',
              children: [{ type: 'link', url: 'mailto:user@example.com' }],
            },
          ],
        },
      ],
    },
    { type: 'paragraph', children: [{ type: 'text', value: 'After' }] },
  ]);
});

it('does not reuse a comment decision across different blockquote prefixes', () => {
  const ast = markdownToAstProcessor(
    editor,
    '<A{/*@example.com>\n\n> <A{/*@example.com>\n> */...props\n> }>text</A>'
  );
  expect(ast.children).toMatchObject([
    {
      type: 'paragraph',
      children: [{ type: 'link', url: 'mailto:A{/*@example.com' }],
    },
    {
      type: 'blockquote',
      children: [
        {
          type: 'paragraph',
          children: [
            {
              type: 'mdxJsxTextElement',
              name: 'A',
              children: [{ type: 'text', value: 'text' }],
            },
          ],
        },
      ],
    },
  ]);
});

it('keeps syntax-significant newlines in comment ownership decisions', () => {
  const ast = markdownToAstProcessor(
    editor,
    '<A{...async/*@example.com>\n\n<A{...async/*@example.com>*/()=>1}>ok</A>'
  );
  expect(ast.children).toMatchObject([
    {
      type: 'paragraph',
      children: [{ type: 'link', url: 'mailto:A{...async/*@example.com' }],
    },
    {
      type: 'paragraph',
      children: [
        {
          type: 'mdxJsxTextElement',
          name: 'A',
          children: [{ type: 'text', value: 'ok' }],
        },
      ],
    },
  ]);
});

it('preserves native JSX when a consumed tag marker resembles a nested blockquote', () => {
  const input = '> <u\n> ><A{/*@example.com>\n> */...a\n> > b}>text</A></u>';
  expect(markdownToAstProcessor(editor, input)).toEqual(
    unified().use(remarkParse).use(baseRemarkMdx).parse(input)
  );
});

it('uses configured Acorn grammar when distinguishing JSX from email links', () => {
  const options: Parameters<typeof remarkMdx>[0] = {
    acornOptions: { ecmaVersion: 2024, sourceType: 'script' },
  };
  const configuredMdx: Plugin = function () {
    remarkMdx.call(this, options);
  };
  const input = "<A{...let+'u@example.com>text'}>label</A>";
  expect(
    markdownToAstProcessor(editor, input, {
      remarkPlugins: [configuredMdx],
    })
  ).toEqual(
    unified().use(remarkParse).use(baseRemarkMdx, options).parse(input)
  );
});

it('calls configured Acorn observers only for the actual parse', () => {
  const beforeTokens: unknown[] = [],
    beforeComments: unknown[] = [];
  const afterTokens: unknown[] = [],
    afterComments: unknown[] = [];
  const input = '<Foo value={/* note */ 1} />\n\nAfter';
  const baseline = unified()
    .use(remarkParse)
    .use(baseRemarkMdx, {
      acornOptions: {
        ecmaVersion: 2024,
        onToken(token) {
          beforeTokens.push(token);
        },
        onComment(...comment) {
          beforeComments.push(comment);
        },
      },
    })
    .parse(input);
  const configuredMdx: Plugin = function () {
    remarkMdx.call(this, {
      acornOptions: {
        ecmaVersion: 2024,
        onToken(token) {
          afterTokens.push(token);
        },
        onComment(...comment) {
          afterComments.push(comment);
        },
      },
    });
  };
  expect(
    markdownToAstProcessor(editor, input, {
      remarkPlugins: [configuredMdx],
    })
  ).toEqual(baseline);
  expect(beforeTokens.length).toBeGreaterThan(0);
  expect(beforeComments).toHaveLength(1);
  expect(afterTokens).toEqual(beforeTokens);
  expect(afterComments).toEqual(beforeComments);
});

it('keeps JSX when a later plugin replaces the parser', () => {
  const resetParser: Plugin = function () {
    remarkParse.call(this);
  };
  const input = '<u>text</u>';
  expect(
    markdownToAstProcessor(editor, input, {
      remarkPlugins: [remarkMdx, resetParser],
    })
  ).toEqual(unified().use(remarkParse).use(baseRemarkMdx).parse(input));
  expect(
    deserializeMd(editor, input, {
      remarkPlugins: [remarkMdx, resetParser],
    })
  ).toEqual([{ type: 'p', children: [{ text: 'text', underline: true }] }]);
});

it('supports installing the exported MDX plugin before remark-parse', () => {
  const input = '<u>text</u>';
  expect(unified().use(remarkMdx).use(remarkParse).parse(input)).toEqual(
    unified().use(baseRemarkMdx).use(remarkParse).parse(input)
  );
});

it('keeps real blockquotes after repeated fence markers inside MDX comments', () => {
  const input =
    '{/*\n~~~\n*/}\n\n> <A{/*@example.com>\n> */...a\n> > b}>text</A>\n\n'.repeat(
      2
    );
  expect(markdownToAstProcessor(editor, input)).toEqual(
    unified().use(remarkParse).use(baseRemarkMdx).parse(input)
  );
});

it('keeps code text after a quoted greater-than sign', () => {
  expect(
    deserializeMd(editor, '`<Foo title=">" data=user@example.com />`')
  ).toEqual([
    {
      type: 'p',
      children: [
        { text: '<Foo title=">" data=user@example.com />', code: true },
      ],
    },
  ]);
});

it.each([
  '<Foo value={{x:1,}} />',
  '<Foo value={() => {return 1}} />',
])('keeps Acorn comma and semicolon observer counts for %s', (input) => {
  const before: unknown[] = [],
    after: unknown[] = [];
  const options = (events: unknown[]): Parameters<typeof remarkMdx>[0] => ({
    acornOptions: {
      ecmaVersion: 2024,
      onTrailingComma(...args) {
        events.push(['comma', ...args]);
      },
      onInsertedSemicolon(...args) {
        events.push(['semicolon', ...args]);
      },
    },
  });
  const configured: Plugin = function () {
    remarkMdx.call(this, options(after));
  };
  unified().use(remarkParse).use(baseRemarkMdx, options(before)).parse(input);
  deserializeMd(editor, input, { remarkPlugins: [configured] });
  expect(before.length).toBeGreaterThan(0);
  expect(after).toEqual(before);
});

it('captures grammar options when the native extension attaches', () => {
  const acornOptions: NonNullable<
    NonNullable<Parameters<typeof remarkMdx>[0]>['acornOptions']
  > = { ecmaVersion: 2024, sourceType: 'script' };
  const options = { acornOptions };
  const configured: Plugin = function () {
    remarkMdx.call(this, options);
  };
  const mutate: Plugin = () => {
    acornOptions.sourceType = 'module';
  };
  const input = "<A{...let+'u@example.com>text'}>label</A>";
  const expected = unified()
    .use(remarkParse)
    .use(baseRemarkMdx, {
      acornOptions: { ecmaVersion: 2024, sourceType: 'script' },
    })
    .parse(input);
  expect(
    markdownToAstProcessor(editor, input, {
      remarkPlugins: [configured, mutate],
    })
  ).toEqual(expected);
});

it('lets a replacement parser trim its source before native parsing', () => {
  const trimmed: Plugin = function () {
    const data = this.data();
    this.parser = (source) =>
      fromMarkdown(source.trim(), {
        extensions: data.micromarkExtensions,
        mdastExtensions: data.fromMarkdownExtensions,
      });
  };
  const input = `${' '.repeat(24)}<Foo title="<ignore@example.com>" /><u>text</u>`;
  expect(
    markdownToAstProcessor(editor, input, {
      remarkPlugins: [remarkMdx, trimmed],
    })
  ).toEqual(unified().use(remarkParse).use(baseRemarkMdx).parse(input.trim()));
});

it('keeps unified legacy Parser fallback authoritative', () => {
  const legacy: Plugin = function () {
    const data = this.data();
    const parse: NonNullable<Processor['parser']> = (source) =>
      fromMarkdown(source, {
        extensions: data.micromarkExtensions,
        mdastExtensions: data.fromMarkdownExtensions,
      });
    this.parser = undefined;
    Reflect.set(this, 'Parser', parse);
  };
  expect(
    deserializeMd(editor, '<u>text</u>', {
      remarkPlugins: [remarkMdx, legacy],
    })
  ).toEqual([{ type: 'p', children: [{ text: 'text', underline: true }] }]);
});

it('keeps quote prefixes after fence markers inside MDX ESM', () => {
  const input =
    'export const a = /*\n~~~\n*/1;\n\n> <u{/*@example.com>\n> */...a\n> > b}>keep</u>';
  expect(markdownToAstProcessor(editor, input)).toEqual(
    unified().use(remarkParse).use(baseRemarkMdx).parse(input)
  );
  expect(deserializeMd(editor, input)).toEqual([
    {
      type: 'blockquote',
      children: [{ type: 'p', children: [{ text: 'keep', underline: true }] }],
    },
  ]);
});

it('keeps native JSX when its closing brace lands on a probe checkpoint', () => {
  const input = `<AA:B{...${'x'.repeat(118)}}/>`;
  expect(markdownToAstProcessor(editor, input)).toEqual(
    unified().use(remarkParse).use(baseRemarkMdx).parse(input)
  );
});

it('keeps an underlined tail after a quoted expression ends on a checkpoint', () => {
  const input = `<u{...'a@b.co>${'x'.repeat(112)}'}>ok</u>`;
  expect(deserializeMd(editor, input)).toEqual([
    { type: 'p', children: [{ text: 'ok', underline: true }] },
  ]);
});

it('keeps code lines outside the HTML attribute conversion range', () => {
  expect(
    deserializeMd(editor, '~~~jsx\n<Foo data=x title=">"\n    />\n~~~')
  ).toEqual([
    {
      type: 'code_block',
      lang: 'jsx',
      children: [
        { type: 'code_line', children: [{ text: '<Foo data="x" title=">"' }] },
        { type: 'code_line', children: [{ text: '    />' }] },
      ],
    },
  ]);
});

it('keeps a native comment whose opening star overlaps an apparent terminator', () => {
  const input = '<u{/*/@example.com>*/...x}>ok</u>';
  expect(markdownToAstProcessor(editor, input)).toEqual(
    unified().use(remarkParse).use(baseRemarkMdx).parse(input)
  );
  expect(deserializeMd(editor, input)).toEqual([
    { type: 'p', children: [{ text: 'ok', underline: true }] },
  ]);
});

it('keeps spread expressions that cross private probe chunk boundaries', () => {
  const input = `<u{/*@example.com>*/${' '.repeat(119)}...x}>ok</u>`;
  expect(markdownToAstProcessor(editor, input)).toEqual(
    unified().use(remarkParse).use(baseRemarkMdx).parse(input)
  );
  expect(deserializeMd(editor, input)).toEqual([
    { type: 'p', children: [{ text: 'ok', underline: true }] },
  ]);
});

it('keeps nested native parses separate from the outer source', () => {
  const nested: Plugin = function () {
    const data = this.data();
    data.micromarkExtensions ??= [];
    data.micromarkExtensions.push({
      text: {
        33: {
          name: 'nestedMarkdown',
          tokenize(_effects, _ok, nok) {
            fromMarkdown(`${'p'.repeat(14)}<u>inner</u>`, {
              extensions: data.micromarkExtensions,
              mdastExtensions: data.fromMarkdownExtensions,
            });
            return nok;
          },
        },
      },
    });
  };
  const input = '! <Foo title="<ignore@example.com>" /><u>outer</u>';
  expect(
    markdownToAstProcessor(editor, input, {
      remarkPlugins: [remarkMdx, nested],
    })
  ).toEqual(unified().use(remarkParse).use(baseRemarkMdx).parse(input));
});

it('keeps quote prefixes for JSX on a column-one lazy continuation', () => {
  const input = '> hello\n<u{/*@example.com>\n> */...a\n> > b}>keep</u>';
  expect(markdownToAstProcessor(editor, input)).toEqual(
    unified().use(remarkParse).use(baseRemarkMdx).parse(input)
  );
});

it('normalizes later tags after a failed probe inside inline code', () => {
  expect(
    deserializeMd(editor, '`<A title=">`\n\ntext<br>after\n\n<u>keep</u>')
  ).toEqual([
    { type: 'p', children: [{ text: '<A title=">', code: true }] },
    {
      type: 'p',
      children: [{ text: 'text' }, { text: '\n' }, { text: 'after' }],
    },
    { type: 'p', children: [{ text: 'keep', underline: true }] },
  ]);
});
