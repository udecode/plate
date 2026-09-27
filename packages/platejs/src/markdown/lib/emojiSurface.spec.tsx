import {
  createTestEditor,
  parseTestMarkdown,
  serializeTestMarkdown,
} from './__tests__/createTestEditor';

describe('emoji shortcode package surfaces', () => {
  it.each([
    {
      expected: '🔥\n',
      input: ':fire:',
      output: [
        {
          children: [{ text: '🔥' }],
          type: 'paragraph',
        },
      ],
      title: 'deserializes a bare emoji shortcode to unicode text',
    },
    {
      expected: 'Launch 🔥 soon\n',
      input: 'Launch :fire: soon',
      output: [
        {
          children: [{ text: 'Launch 🔥 soon' }],
          type: 'paragraph',
        },
      ],
      title: 'deserializes inline emoji shortcodes inside paragraph text',
    },
  ])('$title', ({ expected, input, output }) => {
    const editor = createTestEditor();

    const value = parseTestMarkdown(editor, input);

    expect(value.children).toMatchObject(output);

    const markdown = serializeTestMarkdown(editor, { document: value }).data;

    expect(markdown).toBe(expected);
  });
});
