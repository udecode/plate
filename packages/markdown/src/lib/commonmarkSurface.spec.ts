import { BaseImagePlugin } from '../../../media/src/lib';

import { createTestEditor } from './__tests__/createTestEditor';
import { deserializeMd } from './deserializer';
import { serializeMd } from './serializer';

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
              type: 'a',
              url: 'https://platejs.org',
            },
          ],
          type: 'p',
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
              type: 'a',
              url: 'https://platejs.org',
            },
          ],
          type: 'p',
        },
      ],
      title:
        'round-trips link-only paragraphs through the markdown package surfaces',
    },
  ])('$title', ({ expected, input, output }) => {
    const editor = createTestEditor();

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject(output);

    const markdown = serializeMd(editor, { value: value as any });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
  });

  it.each([
    {
      expected: '![Caption](/image.png)\n',
      input: '![Caption](/image.png)',
      output: [
        {
          caption: [{ text: 'Caption' }],
          children: [{ text: '' }],
          type: 'img',
          url: '/image.png',
        },
      ],
      title: 'round-trips markdown images without titles',
    },
    {
      expected: '![Caption](/image.png "Image title")\n',
      input: '![Caption](/image.png "Image title")',
      output: [
        {
          caption: [{ text: 'Caption' }],
          children: [{ text: '' }],
          title: 'Image title',
          type: 'img',
          url: '/image.png',
        },
      ],
      title: 'preserves explicit image titles instead of mirroring the caption',
    },
    {
      expected: '![](/image.png)\n',
      input: '![](/image.png)',
      output: [
        {
          caption: [{ text: '' }],
          children: [{ text: '' }],
          type: 'img',
          url: '/image.png',
        },
      ],
      title: 'round-trips markdown images with empty alt text',
    },
    {
      expected: '![Caption](/image.png)\n',
      input: '![Caption](/image.png)',
      output: [
        {
          caption: [{ text: 'Caption' }],
          children: [{ text: '' }],
          type: 'img',
          url: '/image.png',
        },
      ],
      title: 'ignores width and height when serializing plain markdown images',
    },
  ])('$title', ({ expected, input, output }) => {
    const editor = createTestEditor([BaseImagePlugin]);

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject(output);

    const markdown = serializeMd(editor, { value: value as any });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
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
          type: 'p',
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
          type: 'p',
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
          type: 'p',
        },
      ],
      title: 'round-trips bold marks at the start of a paragraph',
    },
  ])('$title', ({ expected, input, output }) => {
    const editor = createTestEditor();

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject(output);

    const markdown = serializeMd(editor, { value: value as any });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
  });

  it('round-trips hard line breaks through the markdown package surfaces', () => {
    const editor = createTestEditor();
    const input = 'alpha\\\nbeta';
    const expected = 'alpha\\\nbeta\n';

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject([
      {
        children: [{ text: 'alpha' }, { text: '\n' }, { text: 'beta' }],
        type: 'p',
      },
    ]);

    const markdown = serializeMd(editor, { value: value as any });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
  });

  it('serializes trailing blockquote breaks without losing the final newline', () => {
    const editor = createTestEditor();
    const value = [
      {
        children: [{ text: 'Block quote' }, { text: '\n' }, { text: '\n' }],
        type: 'blockquote',
      },
    ] as any;

    expect(serializeMd(editor, { value })).toBe('> Block quote\\ \n> <br />\n');
  });

  it('round-trips hard line breaks inside nested blockquotes', () => {
    const editor = createTestEditor();
    const input = '> > inner\\\n> > tail';
    const expected = '> > inner\\\n> > tail\n';

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject([
      {
        children: [
          {
            children: [
              {
                children: [{ text: 'inner' }, { text: '\n' }, { text: 'tail' }],
                type: 'p',
              },
            ],
            type: 'blockquote',
          },
        ],
        type: 'blockquote',
      },
    ]);

    const markdown = serializeMd(editor, { value: value as any });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
  });
});
