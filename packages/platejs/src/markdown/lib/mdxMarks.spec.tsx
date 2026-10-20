/** @jsx jsxt */

import { jsxt } from '#platejs-test-internal';

import {
  createTestEditor,
  parseTestMarkdown,
  serializeTestMarkdown,
} from './__tests__/createTestEditor';

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
          type: 'paragraph',
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
          type: 'paragraph',
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
          type: 'paragraph',
        },
      ],
      title: 'round-trips superscript marks through mdx text elements',
    },
    {
      expected:
        '<span style="background-color: #FE9900;"><span style="color: #FEFF00;"><span style="font-family: Inter;"><span style="font-size: 16px;">Styled</span></span></span></span>\n',
      input:
        '<span style="background-color: #FE9900; color: #FEFF00; font-family: Inter; font-size: 16px;">Styled</span>',
      output: [
        {
          children: [
            {
              backgroundColor: '#FE9900',
              color: '#FEFF00',
              fontFamily: 'Inter',
              fontSize: '16px',
              text: 'Styled',
            },
          ],
          type: 'paragraph',
        },
      ],
      title: 'composes every feature-owned span mark mapping',
    },
  ])('$title', ({ expected, input, output }) => {
    const value = parseTestMarkdown(editor, input);

    expect(value.children).toMatchObject(output);

    const markdown = serializeTestMarkdown(editor, { document: value }).data;

    expect(markdown).toBe(expected);
    expect(parseTestMarkdown(editor, markdown)).toMatchObject(value);
  });

  it('refuses a span that holds only a font weight', () => {
    expect(() =>
      parseTestMarkdown(editor, '<span style="font-weight: bold;">Term</span>')
    ).toThrow('Markdown tag <span> was not accepted by an installed mapping');
  });

  it('drops a font weight beside another span style', () => {
    expect(
      parseTestMarkdown(
        editor,
        '<span style="font-size: 16px; font-weight: bold;">Term</span>'
      ).children
    ).toEqual([
      { children: [{ fontSize: '16px', text: 'Term' }], type: 'paragraph' },
    ]);
  });
});
