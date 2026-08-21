/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { testValue } from '../../../../../../packages/markdown/src/lib/__tests__/testValue';
import { createTestEditor } from './createTestEditor';

const editor = createTestEditor();

jsxt;

describe('editor.api.markdown.serialize', () => {
  it('serializes a simple paragraph', () => {
    const result = editor.api.markdown.serialize({
      spread: true,
      value: { children: testValue },
    });
    expect(result).toMatchSnapshot();
  });

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
      const result = editor.api.markdown.serialize({
        value: { children: slateNodes },
      });
      expect(result).toMatchSnapshot();
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

      const result = editor.api.markdown.serialize({
        value: { children: slateNodes },
      });
      expect(result).toMatchSnapshot();
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

      expect(
        editor.api.markdown.serialize({ value: { children: slateNodes } })
      ).toMatchSnapshot();
    });

    it('serializes a block quote as a single line', () => {
      const slateNodes = [
        {
          children: [
            { text: 'Block quote' },
            { text: ' with a new line ' },
            { bold: true, code: true, italic: true, text: ' Inline code' },
          ],
          type: 'blockquote',
        },
      ];

      expect(
        editor.api.markdown.serialize({ value: { children: slateNodes } })
      ).toMatchSnapshot();
    });

    it('serializes a code block', () => {
      const slateNodes = [
        {
          children: [
            { text: 'Code block 1 line 1' },
            { text: 'Code block 1 line 2' },
            { children: [{ text: 'Code block 1 line 3' }], type: 'codeLine' },
            { text: 'Code block 1 line 4', type: 'codeLine' },
          ],
          type: 'codeBlock',
        },
      ];

      expect(
        editor.api.markdown.serialize({ value: { children: slateNodes } })
      ).toMatchSnapshot();
    });

    it(String.raw`serializes a \n within a block quote as a new line`, () => {
      const slateNodes = [
        {
          children: [
            { text: 'Block quote' },
            { text: '\n' },
            { text: 'with a new line' },
          ],
          type: 'blockquote',
        },
      ];

      expect(
        editor.api.markdown.serialize({ value: { children: slateNodes } })
      ).toMatchSnapshot();
    });

    it(
      String.raw`serializes two \n within a block quote as two new lines`,
      () => {
        const slateNodes = [
          {
            children: [
              { text: 'Block quote' },
              { text: '\n' },
              { text: '\n' },
              { text: 'with a new line' },
            ],
            type: 'blockquote',
          },
        ];

        expect(
          editor.api.markdown.serialize({ value: { children: slateNodes } })
        ).toMatchSnapshot();
      }
    );

    it(
      String.raw`serializes two trailing \n in a block quote as a forced line break and <br />`,
      () => {
        const slateNodes = [
          {
            children: [{ text: 'Block quote' }, { text: '\n' }, { text: '\n' }],
            type: 'blockquote',
          },
        ];

        expect(
          editor.api.markdown.serialize({ value: { children: slateNodes } })
        ).toBe('> Block quote\\ \n> <br />\n');
      }
    );

    it(
      String.raw`serializes three trailing \n in a paragraph as a forced line break and <br />`,
      () => {
        const slateNodes = [
          {
            children: [
              { text: 'Paragaph with two new Lines' },
              { text: '\n' },
              { text: '\n' },
              { text: '\n' },
            ],
            type: 'paragraph',
          },
        ];

        expect(
          editor.api.markdown.serialize({ value: { children: slateNodes } })
        ).toBe('Paragaph with two new Lines\\\n\\ \n<br />\n');
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

    expect(
      editor.api.markdown.serialize({ value: { children: slateNodes } })
    ).toMatchSnapshot();
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

    expect(
      editor.api.markdown.serialize({ value: { children: slateNodes } })
    ).toMatchSnapshot();
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

    const resultDefault = editor.api.markdown.serialize({
      value: { children: listFragment },
    });
    expect(resultDefault).toBe('1. 1\n2. 2\n');

    const resultWithSpread = editor.api.markdown.serialize({
      spread: true,
      value: { children: listFragment },
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
    const result = editor.api.markdown.serialize({
      remarkStringifyOptions: {
        handlers: {
          strong: (node, _parent, state, info) => {
            const value = state.containerPhrasing(node, info);
            return `*${value}*`;
          },
        },
      },
      value: { children: slateNodes },
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

    const result = editor.api.markdown.serialize({
      value: { children: slateNodes },
    });

    expect(result).toBe(
      '| First paragraph<br/>Second paragraph | Single paragraph |\n| ------------------------------------ | ---------------- |\n'
    );
  });
});
