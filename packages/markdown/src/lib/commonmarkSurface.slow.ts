import { createTestEditor } from './__tests__/createTestEditor';

describe('commonmark package surfaces', () => {
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
  ])('round-trips $title without conflating their semantics', ({
    alt,
    caption,
  }) => {
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
  });

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
