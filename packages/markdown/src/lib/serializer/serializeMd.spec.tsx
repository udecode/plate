/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createTestEditor } from '../__tests__/createTestEditor';
import { testValue } from '../__tests__/testValue';
import { serializeMd } from './serializeMd';
const editor = createTestEditor();

jsxt;

describe('serializeMd', () => {
  it('serializes a simple paragraph', () => {
    const result = serializeMd(editor as any, {
      spread: true,
      value: testValue,
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
          type: 'p',
        },
      ];
      const result = serializeMd(editor as any, { value: slateNodes });
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
          type: 'p',
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
          type: 'p',
        },
      ];

      const result = serializeMd(editor as any, { value: slateNodes });
      expect(result).toMatchSnapshot();
    });

    // https://github.com/inokawa/remark-slate-transformer/issues/145
    it('serializes inline code', () => {
      const slateNodes = [
        {
          children: [
            { bold: true, code: true, italic: true, text: 'Inline code' },
          ],
          type: 'p',
        },
        {
          children: [{ code: true, italic: true, text: 'Inline code' }],
          type: 'p',
        },
      ];

      expect(
        serializeMd(editor as any, { value: slateNodes })
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
        serializeMd(editor as any, { value: slateNodes })
      ).toMatchSnapshot();
    });

    it('serializes a code block', () => {
      const slateNodes = [
        {
          children: [
            { text: 'Code block 1 line 1' },
            { text: 'Code block 1 line 2' },
            { children: [{ text: 'Code block 1 line 3' }], type: 'code_line' },
            { text: 'Code block 1 line 4', type: 'code_line' },
          ],
          type: 'code_block',
        },
      ];

      expect(
        serializeMd(editor as any, { value: slateNodes })
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
        serializeMd(editor as any, { value: slateNodes })
      ).toMatchSnapshot();
    });

    it(String.raw`serializes two \n within a block quote as two new lines`, () => {
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
        serializeMd(editor as any, { value: slateNodes })
      ).toMatchSnapshot();
    });

    it(String.raw`serializes two trailing \n in a block quote as a forced line break and <br />`, () => {
      const slateNodes = [
        {
          children: [{ text: 'Block quote' }, { text: '\n' }, { text: '\n' }],
          type: 'blockquote',
        },
      ];

      expect(serializeMd(editor as any, { value: slateNodes })).toBe(
        '> Block quote\\ \n> <br />\n'
      );
    });

    it(String.raw`serializes three trailing \n in a paragraph as a forced line break and <br />`, () => {
      const slateNodes = [
        {
          children: [
            { text: 'Paragaph with two new Lines' },
            { text: '\n' },
            { text: '\n' },
            { text: '\n' },
          ],
          type: 'p',
        },
      ];

      expect(serializeMd(editor as any, { value: slateNodes })).toBe(
        'Paragaph with two new Lines\\\n\\ \n<br />\n'
      );
    });
  });

  it('serializes a trailing break in a paragraph as <br />', () => {
    const slateNodes = [
      {
        children: [{ text: 'Paragaph with a new Line' }, { text: '\n' }],
        type: 'p',
      },
    ];

    expect(serializeMd(editor as any, { value: slateNodes })).toMatchSnapshot();
  });

  it('serializes paragraphs containing only a new line as <br />', () => {
    const slateNodes = [
      {
        children: [{ text: '\n' }],
        type: 'p',
      },
      {
        children: [{ text: '\n' }],
        type: 'p',
      },
    ];

    expect(serializeMd(editor as any, { value: slateNodes })).toMatchSnapshot();
  });

  it('serializes lists with spread correctly', () => {
    const listFragment = [
      {
        children: [{ text: '1' }],
        indent: 1,
        listStyleType: 'decimal',
        type: 'p',
      },
      {
        children: [{ text: '2' }],
        indent: 1,
        listStart: 2,
        listStyleType: 'decimal',
        type: 'p',
      },
    ];

    const resultDefault = serializeMd(editor as any, { value: listFragment });
    expect(resultDefault).toBe('1. 1\n2. 2\n');

    const resultWithSpread = serializeMd(editor as any, {
      spread: true,
      value: listFragment,
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
        type: 'p',
      },
    ];
    const result = serializeMd(editor as any, {
      remarkStringifyOptions: {
        handlers: {
          strong: (node, _parent, state, info) => {
            const value = state.containerPhrasing(node, info);
            return `*${value}*`;
          },
        },
      },
      value: slateNodes,
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
                    type: 'p',
                  },
                  {
                    children: [{ text: 'Second paragraph' }],
                    type: 'p',
                  },
                ],
                type: 'td',
              },
              {
                children: [
                  {
                    children: [{ text: 'Single paragraph' }],
                    type: 'p',
                  },
                ],
                type: 'td',
              },
            ],
            type: 'tr',
          },
        ],
        type: 'table',
      },
    ];

    const result = serializeMd(editor as any, { value: slateNodes });

    expect(result).toBe(
      '| First paragraph<br/>Second paragraph | Single paragraph |\n| ------------------------------------ | ---------------- |\n'
    );
  });
});
