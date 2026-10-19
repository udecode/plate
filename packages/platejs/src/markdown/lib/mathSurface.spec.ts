import {
  createTestEditor,
  parseTestMarkdown,
  serializeTestMarkdown,
} from './__tests__/createTestEditor';

describe('math package surfaces', () => {
  it('round-trips inline math through the markdown package surfaces', () => {
    const editor = createTestEditor();
    const input = 'Inline $x+1$ math';
    const expected = 'Inline $x+1$ math\n';

    const value = parseTestMarkdown(editor, input);

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

    const markdown = serializeTestMarkdown(editor, { document: value }).data;

    expect(markdown).toBe(expected);
    expect(parseTestMarkdown(editor, markdown)).toMatchObject(value);
  });

  it('keeps a dollar sign before an escaped character as text', () => {
    const editor = createTestEditor();
    const value = {
      children: [{ children: [{ text: 'x$*$y' }], type: 'paragraph' }],
    };

    const markdown = serializeTestMarkdown(editor, { document: value }).data;

    expect(parseTestMarkdown(editor, markdown).children).toEqual(
      value.children
    );
  });

  it('round-trips block math through the markdown package surfaces', () => {
    const editor = createTestEditor();
    const input = '$$\nx+1\n$$';
    const expected = '$$\nx+1\n$$\n';

    const value = parseTestMarkdown(editor, input);

    expect(value.children).toMatchObject([
      {
        children: [{ text: '' }],
        latex: 'x+1',
        type: 'equation',
      },
    ]);

    const markdown = serializeTestMarkdown(editor, { document: value }).data;

    expect(markdown).toBe(expected);
    expect(parseTestMarkdown(editor, markdown)).toMatchObject(value);
  });
});
