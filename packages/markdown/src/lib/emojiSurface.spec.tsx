import { createTestEditor } from './__tests__/createTestEditor';

describe('emoji shortcode package surfaces', () => {
  it.each([
    {
      expected: '🔥\n',
      input: ':fire:',
      output: [
        {
          children: [{ text: '🔥' }],
          type: 'p',
        },
      ],
      title: 'deserializes a bare emoji shortcode to unicode text',
    },
    {
      expected: 'Launch 🔥 soon\n',
      input: 'Launch :fire: soon',
      output: [
        {
          children: [{ text: 'Launch ' }, { text: '🔥' }, { text: ' soon' }],
          type: 'p',
        },
      ],
      title: 'deserializes inline emoji shortcodes inside paragraph text',
    },
  ])('$title', ({ expected, input, output }) => {
    const editor = createTestEditor();

    const value = editor.api.markdown.deserialize(input);

    expect(value.children).toMatchObject(output);

    const markdown = editor.api.markdown.serialize({ value });

    expect(markdown).toBe(expected);
  });
});
