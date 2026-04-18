import { createTestEditor } from './__tests__/createTestEditor';
import { deserializeMd } from './deserializer';
import { serializeMd } from './serializer';

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
              type: 'a',
              url: 'https://platejs.org',
            },
          ],
          type: 'p',
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
              type: 'a',
              url: 'https://platejs.org',
            },
            { text: ' for docs.' },
          ],
          type: 'p',
        },
      ],
      title: 'round-trips an autolink literal inside surrounding text',
    },
  ])('$title', ({ expected, input, output }) => {
    const editor = createTestEditor();

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject(output);

    const markdown = serializeMd(editor, { value: value as any });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
  });

  it('round-trips footnote references and definitions as dedicated nodes', () => {
    const editor = createTestEditor();
    const input = '[^1]\n\n[^1]: Footnote text';
    const expected = '[^1]\n\n[^1]: Footnote text\n';

    const value = deserializeMd(editor, input);

    expect(value).toMatchObject([
      {
        children: [
          {
            children: [{ text: '' }],
            identifier: '1',
            type: 'footnoteReference',
          },
        ],
        type: 'p',
      },
      {
        children: [
          {
            children: [{ text: 'Footnote text' }],
            type: 'p',
          },
        ],
        identifier: '1',
        type: 'footnoteDefinition',
      },
    ]);

    const markdown = serializeMd(editor, { value: value as any });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
  });
});
