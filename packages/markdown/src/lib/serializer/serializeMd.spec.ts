import { createTestEditor } from '../__tests__/createTestEditor';
import { testValue } from '../__tests__/testValue';
import { serializeMd } from './serializeMd';
const editor = createTestEditor();

describe('serializeMd', () => {
  it('should serialize a simple paragraph', () => {
    const result = serializeMd(editor as any, { value: testValue });
    expect(result).toMatchSnapshot();
  });

  describe('fixures', () => {
    // https://github.com/inokawa/remark-slate-transformer/issues/44
    it('should serialize marks with trailing whitespace', () => {
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
    it('Combination of bold and italic at the start of a block losing formatting', () => {
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
    it('should serialize a value with inline code', () => {
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

    it('should serialize a value within a block qoute as a single line', () => {
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

    it(
      String.raw`should serialize a \n within a block qoute as new paragraph`,
      () => {
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
      }
    );
  });
});
