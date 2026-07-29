/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createTestEditor } from './__tests__/createTestEditor';

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
            { script: 'sub', text: '2' },
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
          children: [{ text: 'E=mc' }, { script: 'sup', text: '2' }],
          type: 'p',
        },
      ],
      title: 'round-trips superscript marks through mdx text elements',
    },
  ])('$title', ({ expected, input, output }) => {
    const value = editor.api.markdown.deserialize(input);

    expect(value.children).toMatchObject(output);

    const markdown = editor.api.markdown.serialize({ value });

    expect(markdown).toBe(expected);
    expect(editor.api.markdown.deserialize(markdown)).toMatchObject(value);
  });
});
