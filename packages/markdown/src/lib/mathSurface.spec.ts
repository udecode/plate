import { createTestEditor } from './__tests__/createTestEditor';

describe('math package surfaces', () => {
  it('round-trips inline math through the markdown package surfaces', () => {
    const editor = createTestEditor();
    const input = 'Inline $x+1$ math';
    const expected = 'Inline $x+1$ math\n';

    const value = editor.api.markdown.deserialize(input);

    expect(value.children).toMatchObject([
      {
        children: [
          { text: 'Inline ' },
          {
            children: [{ text: '' }],
            latex: 'x+1',
            type: 'inlineEquation',
          },
          { text: ' math' },
        ],
        type: 'paragraph',
      },
    ]);

    const markdown = editor.api.markdown.serialize({ value });

    expect(markdown).toBe(expected);
    expect(editor.api.markdown.deserialize(markdown)).toMatchObject(value);
  });

  it('round-trips block math through the markdown package surfaces', () => {
    const editor = createTestEditor();
    const input = '$$\nx+1\n$$';
    const expected = '$$\nx+1\n$$\n';

    const value = editor.api.markdown.deserialize(input);

    expect(value.children).toMatchObject([
      {
        children: [{ text: '' }],
        latex: 'x+1',
        type: 'equation',
      },
    ]);

    const markdown = editor.api.markdown.serialize({ value });

    expect(markdown).toBe(expected);
    expect(editor.api.markdown.deserialize(markdown)).toMatchObject(value);
  });
});
