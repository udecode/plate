import {
  createTestEditor,
  parseTestMarkdown,
  serializeTestMarkdown,
} from './__tests__/createTestEditor';

describe('markdown Details surface', () => {
  it('round-trips a heading title as the heading GitHub renders, with its inline marks', () => {
    const editor = createTestEditor();
    const input =
      '<details>\n\n<summary><h2>**Title** [link](https://example.com)</h2></summary>\n\nBody\n\n</details>\n';
    const value = parseTestMarkdown(editor, input);
    expect(value.children[0]).toMatchObject({
      type: 'details',
      children: [
        {
          type: 'summary',
          level: 2,
          children: [
            { text: 'Title', bold: true },
            { text: ' ' },
            {
              type: 'link',
              url: 'https://example.com',
              children: [{ text: 'link' }],
            },
            { text: '' },
          ],
        },
        { type: 'paragraph', children: [{ text: 'Body' }] },
      ],
    });
    expect(serializeTestMarkdown(editor, { document: value }).data).toBe(input);
  });

  it('keeps a title whose heading is not its whole content as text', () => {
    const editor = createTestEditor();
    const value = parseTestMarkdown(
      editor,
      '<details>\n\n<summary><h2>Title</h2> more</summary>\n\nBody\n\n</details>'
    );

    expect(value.children[0]).toHaveProperty(['children', 0], {
      type: 'summary',
      children: [{ text: '<h2>Title</h2> more' }],
    });
  });

  it('reads a nested title level attribute and keeps it through Markdown', () => {
    const editor = createTestEditor();
    const value = parseTestMarkdown(
      editor,
      '<details>\n\n<summary>Outer</summary>\n\n<details>\n\n<summary level="3">Inner</summary>\n\nBody\n\n</details>\n\n</details>'
    );

    expect(value.children[0]).toHaveProperty(['children', 1, 'children', 0], {
      type: 'summary',
      level: 3,
      children: [{ text: 'Inner' }],
    });
    expect(
      parseTestMarkdown(
        editor,
        serializeTestMarkdown(editor, { document: value }).data
      )
    ).toEqual(value);
  });

  it('round-trips nested Details with direct body blocks', () => {
    const editor = createTestEditor();
    const input = `<details>
  <summary>Outer summary</summary>

  Outer body

  <details>
    <summary>Inner summary</summary>

    Inner body
  </details>
</details>
`;

    const value = parseTestMarkdown(editor, input);

    expect(value.children).toMatchObject([
      {
        children: [
          { children: [{ text: 'Outer summary' }], type: 'summary' },
          { children: [{ text: 'Outer body' }], type: 'paragraph' },
          {
            children: [
              { children: [{ text: 'Inner summary' }], type: 'summary' },
              { children: [{ text: 'Inner body' }], type: 'paragraph' },
            ],
            type: 'details',
          },
        ],
        type: 'details',
      },
    ]);

    const markdown = serializeTestMarkdown(editor, { document: value }).data;

    expect(markdown).toBe(`<details>

<summary>Outer summary</summary>

Outer body

<details>

<summary>Inner summary</summary>

Inner body

</details>

</details>
`);
    expect(parseTestMarkdown(editor, markdown)).toEqual(value);
  });

  it('ignores persisted disclosure attributes', () => {
    const editor = createTestEditor();
    const value = parseTestMarkdown(
      editor,
      '<details open name="shared">\n  <summary>Summary</summary>\n\n  Body\n</details>'
    );

    expect(value.children[0]).not.toHaveProperty('open');
    expect(value.children[0]).not.toHaveProperty('name');
    expect(serializeTestMarkdown(editor, { document: value }).data).toBe(
      '<details>\n\n<summary>Summary</summary>\n\nBody\n\n</details>\n'
    );
  });
});
