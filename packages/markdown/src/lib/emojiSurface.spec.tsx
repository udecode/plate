import { createTestEditor } from './__tests__/createTestEditor';
import { deserializeMd } from './deserializer';
import { serializeMd } from './serializer';

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

    const value = deserializeMd(editor as any, input);

    expect(value).toMatchObject(output);

    const markdown = serializeMd(editor as any, { value: value as any });

    expect(markdown).toBe(expected);
  });
});
