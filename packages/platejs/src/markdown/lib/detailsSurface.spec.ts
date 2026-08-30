import { createTestEditor } from './__tests__/createTestEditor';

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

    const value = editor.api.markdown.deserialize(input);

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

    const markdown = editor.api.markdown.serialize({ value });

    expect(markdown).toBe(`<details>
  <summary>
    Outer summary
  </summary>

  Outer body

  <details>
    <summary>
      Inner summary
    </summary>

    Inner body
  </details>
</details>
`);
    expect(editor.api.markdown.deserialize(markdown)).toMatchObject(value);
  });

  it('ignores persisted disclosure attributes', () => {
    const editor = createTestEditor();
    const value = editor.api.markdown.deserialize(
      '<details open name="shared">\n  <summary>Summary</summary>\n\n  Body\n</details>'
    );

    expect(value.children[0]).not.toHaveProperty('open');
    expect(value.children[0]).not.toHaveProperty('name');
    expect(editor.api.markdown.serialize({ value })).toBe(
      '<details>\n  <summary>\n    Summary\n  </summary>\n\n  Body\n</details>\n'
    );
  });
});
