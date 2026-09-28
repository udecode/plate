import {
  createTestEditor,
  parseTestMarkdown,
  serializeTestMarkdown,
} from './__tests__/createTestEditor';

describe('markdown Details surface', () => {
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
