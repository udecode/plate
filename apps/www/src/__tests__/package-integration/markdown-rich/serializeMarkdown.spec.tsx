/** @jsx jsxt */

import { jsxt } from '@platejs/test';

import { createTestEditor } from './createTestEditor';

const editor = createTestEditor();
const serializeMarkdown = (
  options: Parameters<typeof editor.api.markdown.serialize>[0]
) => {
  const result = editor.api.markdown.serialize(options);

  if (!result.ok) throw new Error(result.diagnostics[0].message);

  return result.data;
};

jsxt;

describe('editor.api.markdown.serialize', () => {
  describe('fixtures', () => {
    // https://github.com/inokawa/remark-slate-transformer/issues/44
    it('serializes marks with trailing whitespace', () => {
      const slateNodes = [
        {
          children: [
            {
              text: 'Make text ',
            },
            {
              bold: true,
              text: 'bold',
            },
            {
              text: ', ',
            },
            {
              italic: true,
              text: 'italic',
            },
            {
              text: ', ',
            },
            {
              text: 'underlined',
              underline: true,
            },
            {
              text: ', or apply a ',
            },
            {
              bold: true,
              italic: true,
              text: 'combination',
              underline: true,
            },
            {
              text: ' of these styles for a visually striking effect.',
            },
          ],
          type: 'paragraph',
        },
      ];
      const result = serializeMarkdown({
        document: { children: slateNodes },
      });
      expect(result).toBe(
        'Make text **bold**, _italic_, <u>underlined</u>, or apply a _**<u>combination</u>**_ of these styles for a visually striking effect.\n'
      );
    });

    // https://github.com/inokawa/remark-slate-transformer/issues/90
    it('keeps bold and italic formatting at the start of a block', () => {
      const slateNodes = [
        {
          children: [
            {
              bold: true,
              italic: true,
              text: 'Italic',
            },
            {
              bold: true,
              text: ' in a bold paragraph',
            },
          ],
          type: 'paragraph',
        },
        {
          children: [
            {
              bold: true,
              text: 'This is an ',
            },
            {
              bold: true,
              italic: true,
              text: 'Italic',
            },
            {
              bold: true,
              text: ' in a bold paragraph',
            },
          ],
          type: 'paragraph',
        },
      ];

      const result = serializeMarkdown({
        document: { children: slateNodes },
      });
      expect(result).toBe(
        '_**Italic**_ **in a bold paragraph**\n\n**This is an _Italic_** **in a bold paragraph**\n'
      );
    });

    // https://github.com/inokawa/remark-slate-transformer/issues/145
    it('serializes inline code', () => {
      const slateNodes = [
        {
          children: [
            { bold: true, code: true, italic: true, text: 'Inline code' },
          ],
          type: 'paragraph',
        },
        {
          children: [{ code: true, italic: true, text: 'Inline code' }],
          type: 'paragraph',
        },
      ];

      expect(serializeMarkdown({ document: { children: slateNodes } })).toBe(
        '_**`Inline code`**_\n\n_`Inline code`_\n'
      );
    });

    it('serializes a block quote as a single line', () => {
      const slateNodes = [
        {
          children: [
            {
              children: [
                { text: 'Block quote' },
                { text: ' with a new line ' },
                { bold: true, code: true, italic: true, text: ' Inline code' },
              ],
              type: 'paragraph',
            },
          ],
          type: 'blockquote',
        },
      ];

      expect(serializeMarkdown({ document: { children: slateNodes } })).toBe(
        '> Block quote with a new line _**` Inline code`**_\n'
      );
    });

    it('serializes a code block', () => {
      const slateNodes = [
        {
          children: [
            {
              text: 'Code block 1 line 1\nCode block 1 line 2\nCode block 1 line 3\nCode block 1 line 4',
            },
          ],
          type: 'codeBlock',
        },
      ];

      expect(serializeMarkdown({ document: { children: slateNodes } })).toBe(
        '```\nCode block 1 line 1\nCode block 1 line 2\nCode block 1 line 3\nCode block 1 line 4\n```\n'
      );
    });

    it(String.raw`serializes a \n within a block quote as a new line`, () => {
      const slateNodes = [
        {
          children: [
            {
              children: [
                { text: 'Block quote' },
                { text: '\n' },
                { text: 'with a new line' },
              ],
              type: 'paragraph',
            },
          ],
          type: 'blockquote',
        },
      ];

      expect(serializeMarkdown({ document: { children: slateNodes } })).toBe(
        '> Block quote\\\n> with a new line\n'
      );
    });

    it(
      String.raw`serializes two \n within a block quote as two new lines`,
      () => {
        const slateNodes = [
          {
            children: [
              {
                children: [
                  { text: 'Block quote' },
                  { text: '\n' },
                  { text: '\n' },
                  { text: 'with a new line' },
                ],
                type: 'paragraph',
              },
            ],
            type: 'blockquote',
          },
        ];

        expect(serializeMarkdown({ document: { children: slateNodes } })).toBe(
          '> Block quote\\\n> \\\n> with a new line\n'
        );
      }
    );
  });

  it('serializes a trailing break in a paragraph as <br />', () => {
    const slateNodes = [
      {
        children: [{ text: 'Paragaph with a new Line' }, { text: '\n' }],
        type: 'paragraph',
      },
    ];

    expect(serializeMarkdown({ document: { children: slateNodes } })).toBe(
      'Paragaph with a new Line\n<br />\n'
    );
  });

  it('serializes paragraphs containing only a new line as <br />', () => {
    const slateNodes = [
      {
        children: [{ text: '\n' }],
        type: 'paragraph',
      },
      {
        children: [{ text: '\n' }],
        type: 'paragraph',
      },
    ];

    expect(serializeMarkdown({ document: { children: slateNodes } })).toBe(
      '\n<br />\n\n\n<br />\n'
    );
  });

  it('serializes lists with spread correctly', () => {
    const listFragment = [
      {
        children: [{ text: '1' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
      {
        children: [{ text: '2' }],
        indent: 1,
        listType: 'numbered',
        type: 'paragraph',
      },
    ];

    const resultDefault = serializeMarkdown({
      document: { children: listFragment },
    });
    expect(resultDefault).toBe('1. 1\n2. 2\n');

    const resultWithSpread = serializeMarkdown({
      spread: true,
      document: { children: listFragment },
    });
    expect(resultWithSpread).toBe('1. 1\n\n2. 2\n');
  });

  it('serializes lists with custom remark-stringify options', () => {
    const slateNodes = [
      {
        children: [
          {
            text: 'Make text ',
          },
          {
            bold: true,
            text: 'bold',
          },
        ],
        type: 'paragraph',
      },
    ];
    const result = serializeMarkdown({
      remarkStringifyOptions: {
        handlers: {
          strong: (node, _parent, state, info) => {
            const value = state.containerPhrasing(node, info);
            return `*${value}*`;
          },
        },
      },
      document: { children: slateNodes },
    });
    expect(result).toBe('Make text *bold*\n');
  });

  it('serializes table cells with multiple blocks using <br/> separators', () => {
    const slateNodes = [
      {
        children: [
          {
            children: [
              {
                children: [
                  {
                    children: [{ text: 'First paragraph' }],
                    type: 'paragraph',
                  },
                  {
                    children: [{ text: 'Second paragraph' }],
                    type: 'paragraph',
                  },
                ],
                type: 'tableCell',
              },
              {
                children: [
                  {
                    children: [{ text: 'Single paragraph' }],
                    type: 'paragraph',
                  },
                ],
                type: 'tableCell',
              },
            ],
            type: 'tableRow',
          },
        ],
        type: 'table',
      },
    ];

    const result = serializeMarkdown({
      document: { children: slateNodes },
    });

    expect(result).toBe(
      '| First paragraph<br/>Second paragraph | Single paragraph |\n| ------------------------------------ | ---------------- |\n'
    );
  });
});
