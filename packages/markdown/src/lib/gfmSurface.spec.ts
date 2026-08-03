import { createTestEditor } from './__tests__/createTestEditor';

describe('gfm package surfaces', () => {
  it.each([
    {
      expected: 'https://platejs.org\n',
      input: 'https://platejs.org',
      output: [
        {
          children: [
            {
              children: [{ text: 'https://platejs.org' }],
              type: 'link',
              url: 'https://platejs.org',
            },
          ],
          type: 'paragraph',
        },
      ],
      title: 'round-trips a bare autolink literal',
    },
    {
      expected: 'Visit https://platejs.org for docs.\n',
      input: 'Visit https://platejs.org for docs.',
      output: [
        {
          children: [
            { text: 'Visit ' },
            {
              children: [{ text: 'https://platejs.org' }],
              type: 'link',
              url: 'https://platejs.org',
            },
            { text: ' for docs.' },
          ],
          type: 'paragraph',
        },
      ],
      title: 'round-trips an autolink literal inside surrounding text',
    },
  ])('$title', ({ expected, input, output }) => {
    const editor = createTestEditor();

    const value = editor.api.markdown.deserialize(input);

    expect(value.children).toMatchObject(output);

    const markdown = editor.api.markdown.serialize({ value });

    expect(markdown).toBe(expected);
    expect(editor.api.markdown.deserialize(markdown)).toMatchObject(value);
  });

  it('respects resourceLink when serializing bare autolink literals', () => {
    const editor = createTestEditor();
    const value = {
      children: [
        {
          children: [
            {
              children: [{ text: 'https://platejs.org' }],
              type: 'link',
              url: 'https://platejs.org',
            },
          ],
          type: 'paragraph',
        },
      ],
    };

    expect(
      editor.api.markdown.serialize({
        remarkStringifyOptions: { resourceLink: true },
        value,
      })
    ).toBe('[https://platejs.org](https://platejs.org)\n');
  });

  it('round-trips footnote references and definitions as dedicated nodes', () => {
    const editor = createTestEditor();
    const input = '[^1]\n\n[^1]: Footnote text';
    const expected = '[^1]\n\n[^1]: Footnote text\n';

    const value = editor.api.markdown.deserialize(input);

    expect(value.children).toMatchObject([
      {
        children: [
          {
            children: [{ text: '' }],
            identifier: '1',
            type: 'footnote',
          },
        ],
        type: 'paragraph',
      },
      {
        children: [
          {
            children: [{ text: 'Footnote text' }],
            type: 'paragraph',
          },
        ],
        identifier: '1',
        type: 'footnoteDefinition',
      },
    ]);

    const markdown = editor.api.markdown.serialize({ value });

    expect(markdown).toBe(expected);
    expect(editor.api.markdown.deserialize(markdown)).toMatchObject(value);
  });
});
