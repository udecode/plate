import { createTestEditor } from './__tests__/createTestEditor';

const commonmarkAstCorpus = [
  { input: '# Heading', title: 'ATX heading' },
  {
    input: 'Paragraph with **bold**, _emphasis_, and `inline code`.',
    title: 'mixed inline marks',
  },
  {
    input: '[Plate](https://platejs.org "Editor framework")',
    title: 'link with title',
  },
  {
    input: '> quoted first line\n>\n> quoted second line',
    title: 'multi-paragraph blockquote',
  },
  { input: '- alpha\n- beta', title: 'bullet list' },
  { input: '1. first\n2. second', title: 'ordered list' },
  {
    input: '```ts\nconst answer = 42;\n```',
    title: 'fenced code block',
  },
  { input: '---', title: 'thematic break' },
  {
    input: '![Caption](/image.png "Image title")',
    title: 'image with title',
  },
  { input: 'alpha  \nbeta', title: 'hard line break' },
  {
    input: 'Escaped \\*asterisk\\* and \\[brackets\\].',
    title: 'escaped punctuation',
  },
  {
    input: '---\ntitle: Example\n---\n\nBody',
    title: 'frontmatter followed by content',
  },
];

const MARKDOWN_STRESS_SEED = 0x50_4c_41_54;
const MARKDOWN_STRESS_CASES = 256;
const markdownStressAtoms = [
  'alpha',
  'beta',
  '0',
  '9',
  "'",
  '’',
  '«',
  '\u200D',
  '\u0300',
  '\u3000',
  '\u00A0',
  '\uFEFF',
  '\uFFFD',
  '🍄',
  '€',
  '永',
] as const;

const createSeededRandom = (seed: number) => {
  let state = seed >>> 0;

  return () => {
    state = (state + 0x6d_2b_79_f5) >>> 0;

    let value = state;

    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);

    return ((value ^ (value >>> 14)) >>> 0) / 0x1_00_00_00_00;
  };
};

const createMarkdownStressCases = () => {
  const random = createSeededRandom(MARKDOWN_STRESS_SEED);
  const pick = <T>(values: readonly T[]) =>
    values[Math.floor(random() * values.length)];
  const text = () => {
    const length = 1 + Math.floor(random() * 6);

    return Array.from({ length }, () => pick(markdownStressAtoms)).join(' ');
  };
  const inline = () => {
    const value = text();

    return pick([
      value,
      `**${value}**`,
      `_${value}_`,
      `\`${value}\``,
      `[${value}](https://example.com/${Math.floor(random() * 1000)})`,
      `Escaped \\*${value}\\*`,
    ]);
  };
  const block = () =>
    pick([
      inline(),
      `## ${text()}`,
      `> ${inline()}`,
      `- ${inline()}\n- ${inline()}`,
      `1. ${inline()}\n2. ${inline()}`,
      `\`\`\`text\n${text()} | # ~ $\n\`\`\``,
      `${inline()}  \n${inline()}`,
    ]);

  return [
    ...markdownStressAtoms.map((atom) => `Required Unicode atom: ${atom}`),
    ...Array.from({ length: MARKDOWN_STRESS_CASES }, () => {
      const blocks = 1 + Math.floor(random() * 4);
      const separator = random() < 0.25 ? '\r\n\r\n' : '\n\n';

      return Array.from({ length: blocks }, block).join(separator);
    }),
  ];
};

describe('commonmark package surfaces', () => {
  it('keeps fixed-seed structural and Unicode inputs AST-stable', () => {
    const editor = createTestEditor();

    createMarkdownStressCases().forEach((input, caseIndex) => {
      try {
        const first = editor.api.markdown.deserialize(input);
        const canonical = editor.api.markdown.serialize({ value: first });
        const second = editor.api.markdown.deserialize(canonical);
        const replay = editor.api.markdown.serialize({ value: second });

        expect(second).toEqual(first);
        expect(editor.api.markdown.deserialize(replay)).toEqual(second);
      } catch (error) {
        throw new Error(
          `Markdown stress failure: seed=${MARKDOWN_STRESS_SEED} case=${caseIndex} input=${JSON.stringify(input)}`,
          { cause: error }
        );
      }
    });
  });

  it.each(commonmarkAstCorpus)(
    'keeps the parsed AST stable for $title',
    ({ input }) => {
      const editor = createTestEditor();
      const first = editor.api.markdown.deserialize(input);
      const canonical = editor.api.markdown.serialize({ value: first });
      const second = editor.api.markdown.deserialize(canonical);
      const replay = editor.api.markdown.serialize({ value: second });

      expect(second).toEqual(first);
      expect(editor.api.markdown.deserialize(replay)).toEqual(second);
    }
  );

  it.each([
    {
      expected: 'Visit [Plate](https://platejs.org)\n',
      input: 'Visit [Plate](https://platejs.org)',
      output: [
        {
          children: [
            { text: 'Visit ' },
            {
              children: [{ text: 'Plate' }],
              type: 'link',
              url: 'https://platejs.org',
            },
          ],
          type: 'paragraph',
        },
      ],
      title: 'round-trips inline links through the markdown package surfaces',
    },
    {
      expected: '[Plate](https://platejs.org)\n',
      input: '[Plate](https://platejs.org)',
      output: [
        {
          children: [
            {
              children: [{ text: 'Plate' }],
              type: 'link',
              url: 'https://platejs.org',
            },
          ],
          type: 'paragraph',
        },
      ],
      title:
        'round-trips link-only paragraphs through the markdown package surfaces',
    },
  ])('$title', ({ expected, input, output }) => {
    const editor = createTestEditor();

    const value = editor.api.markdown.deserialize(input);

    expect(value.children).toMatchObject(output);

    const markdown = editor.api.markdown.serialize({ value });

    expect(markdown).toBe(expected);
    expect(editor.api.markdown.deserialize(markdown)).toMatchObject(value);
  });

  it.each([
    {
      alt: 'Caption',
      expected: '![Caption](/image.png)\n',
      input: '![Caption](/image.png)',
      title: 'round-trips markdown images without titles',
    },
    {
      alt: 'Caption',
      expected: '![Caption](/image.png "Image title")\n',
      input: '![Caption](/image.png "Image title")',
      imageTitle: 'Image title',
      title: 'preserves explicit image titles independently from alt text',
    },
    {
      alt: '',
      expected: '![](/image.png)\n',
      input: '![](/image.png)',
      title: 'round-trips markdown images with empty alt text',
    },
  ])('$title', ({ alt, expected, imageTitle, input }) => {
    const editor = createTestEditor();
    const document = editor.api.markdown.deserialize(input);
    const image = document.children[0];

    expect(image).toMatchObject({
      alt,
      children: [{ text: '' }],
      ...(imageTitle ? { title: imageTitle } : {}),
      type: 'image',
      url: '/image.png',
    });
    expect(document).not.toHaveProperty('roots');

    expect(editor.api.markdown.serialize({ value: document })).toBe(expected);
  });

  it.each([
    {
      alt: 'Screen reader text',
      caption: 'Visible caption',
      title: 'distinct alt and caption',
    },
    {
      alt: 'Same text',
      caption: 'Same text',
      title: 'textually equal alt and caption',
    },
  ])(
    'round-trips $title without conflating their semantics',
    ({ alt, caption }) => {
      const editor = createTestEditor();
      const value = {
        children: [
          {
            alt,
            children: [{ text: caption }],
            type: 'image',
            url: '/image.png',
          },
        ],
      };
      const markdown = editor.api.markdown.serialize({ value });

      expect(markdown).toContain('<figure>');
      expect(markdown).toContain(`<img alt="${alt}" src="/image.png" />`);
      expect(markdown).toContain('<figcaption>');
      expect(editor.api.markdown.deserialize(markdown)).toMatchObject(value);
    }
  );

  it.each([
    {
      expected: 'This has **bold**, _italic_, and `code`.\n',
      input: 'This has **bold**, _italic_, and `code`.',
      output: [
        {
          children: [
            { text: 'This has ' },
            { bold: true, text: 'bold' },
            { text: ', ' },
            { italic: true, text: 'italic' },
            { text: ', and ' },
            { code: true, text: 'code' },
            { text: '.' },
          ],
          type: 'paragraph',
        },
      ],
      title: 'round-trips mixed bold italic and inline code marks',
    },
    {
      expected: '~~strike~~\n',
      input: '~~strike~~',
      output: [
        {
          children: [{ strikethrough: true, text: 'strike' }],
          type: 'paragraph',
        },
      ],
      title: 'round-trips strikethrough marks',
    },
    {
      expected: '**padded** text\n',
      input: '**padded** text',
      output: [
        {
          children: [{ bold: true, text: 'padded' }, { text: ' text' }],
          type: 'paragraph',
        },
      ],
      title: 'round-trips bold marks at the start of a paragraph',
    },
  ])('$title', ({ expected, input, output }) => {
    const editor = createTestEditor();

    const value = editor.api.markdown.deserialize(input);

    expect(value.children).toMatchObject(output);

    const markdown = editor.api.markdown.serialize({ value });

    expect(markdown).toBe(expected);
    expect(editor.api.markdown.deserialize(markdown)).toMatchObject(value);
  });

  it('round-trips hard line breaks through the markdown package surfaces', () => {
    const editor = createTestEditor();
    const input = 'alpha\\\nbeta';
    const expected = 'alpha\\\nbeta\n';

    const value = editor.api.markdown.deserialize(input);

    expect(value.children).toMatchObject([
      {
        children: [{ text: 'alpha' }, { text: '\n' }, { text: 'beta' }],
        type: 'paragraph',
      },
    ]);

    const markdown = editor.api.markdown.serialize({ value });

    expect(markdown).toBe(expected);
    expect(editor.api.markdown.deserialize(markdown)).toMatchObject(value);
  });

  it('round-trips hard line breaks embedded inside one text leaf', () => {
    const editor = createTestEditor();
    const value = {
      children: [
        {
          children: [
            {
              text: 'Text followed by two empty lines\n\n\nFollowed by more text.',
            },
          ],
          type: 'paragraph',
        },
      ],
    };

    const markdown = editor.api.markdown.serialize({ value });

    expect(markdown).toBe(
      'Text followed by two empty lines\\\n\\\n\\\nFollowed by more text.\n'
    );
    expect(editor.api.markdown.deserialize(markdown).children).toMatchObject([
      {
        children: [
          { text: 'Text followed by two empty lines' },
          { text: '\n' },
          { text: '\n' },
          { text: '\n' },
          { text: 'Followed by more text.' },
        ],
        type: 'paragraph',
      },
    ]);
  });

  it('serializes a trailing hard break embedded inside one text leaf like a split break child', () => {
    const editor = createTestEditor();

    expect(
      editor.api.markdown.serialize({
        value: {
          children: [
            {
              children: [{ text: 'alpha\n' }],
              type: 'paragraph',
            },
          ],
        },
      })
    ).toBe('alpha\n<br />\n');
  });

  it('serializes trailing blockquote breaks without losing the final newline', () => {
    const editor = createTestEditor();
    const value = {
      children: [
        {
          children: [{ text: 'Block quote' }, { text: '\n' }, { text: '\n' }],
          type: 'blockquote',
        },
      ],
    };

    expect(editor.api.markdown.serialize({ value })).toBe(
      '> Block quote\\ \n> <br />\n'
    );
  });

  it('round-trips hard line breaks inside nested blockquotes', () => {
    const editor = createTestEditor();
    const input = '> > inner\\\n> > tail';
    const expected = '> > inner\\\n> > tail\n';

    const value = editor.api.markdown.deserialize(input);

    expect(value.children).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [{ text: 'inner' }, { text: '\n' }, { text: 'tail' }],
                type: 'paragraph',
              },
            ],
            type: 'blockquote',
          },
        ],
        type: 'blockquote',
      },
    ]);

    const markdown = editor.api.markdown.serialize({ value });

    expect(markdown).toBe(expected);
    expect(editor.api.markdown.deserialize(markdown)).toMatchObject(value);
  });
});
