/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createTestEditor } from './__tests__/createTestEditor';
import { deserializeMd } from './deserializer';
import { serializeMd } from './serializer';

jsxt;

const editor = createTestEditor();

describe('mdx mark package surfaces', () => {
  it.each([
    {
      expected: '<mark>highlight</mark>\n',
      input: '<mark>highlight</mark>',
      output: [
        {
          children: [{ highlight: true, text: 'highlight' }],
          type: 'p',
        },
      ],
      title: 'round-trips highlight marks through mdx text elements',
    },
    {
      expected: 'H<sub>2</sub>O\n',
      input: 'H<sub>2</sub>O',
      output: [
        {
          children: [
            { text: 'H' },
            { subscript: true, text: '2' },
            { text: 'O' },
          ],
          type: 'p',
        },
      ],
      title: 'round-trips subscript marks through mdx text elements',
    },
    {
      expected: 'E=mc<sup>2</sup>\n',
      input: 'E=mc<sup>2</sup>',
      output: [
        {
          children: [{ text: 'E=mc' }, { superscript: true, text: '2' }],
          type: 'p',
        },
      ],
      title: 'round-trips superscript marks through mdx text elements',
    },
  ])('$title', ({ expected, input, output }) => {
    const value = deserializeMd(editor, input);

    expect(value).toMatchObject(output);

    const markdown = serializeMd(editor, { value: value as any });

    expect(markdown).toBe(expected);
    expect(deserializeMd(editor, markdown)).toMatchObject(value);
  });
});
