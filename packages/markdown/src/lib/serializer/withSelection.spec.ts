/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { createTestEditor } from '../__tests__/createTestEditor';
import { serializeMd } from './serializeMd';

jsx;

const editor = createTestEditor();

describe('withSelection', () => {
  describe('serializeMd with selection', () => {
    describe('serializeMd with selection', () => {
      it('should include selection markers when withSelection is true', () => {
        editor.selection = {
          anchor: { offset: 0, path: [0, 0] },
          focus: { offset: 5, path: [0, 0] },
        };

        const slateNodes = [
          {
            children: [{ text: 'Hello world' }],
            type: 'p',
          },
        ];

        const result = serializeMd(editor as any, {
          value: slateNodes,
          withSelection: true,
        });

        expect(result).toBe('<selection>Hello</selection> world\n');
      });

      it('should mark selected text with selection markers', () => {
        editor.selection = {
          anchor: { offset: 0, path: [0, 1] },
          focus: { offset: 4, path: [0, 1] },
        };

        const slateNodes = [
          {
            children: [
              { text: 'Select ' },
              { text: 'this' },
              { text: ' text' },
            ],
            type: 'p',
          },
        ];

        const result = serializeMd(editor as any, {
          value: slateNodes,
          withSelection: true,
        });

        // This test will fail initially - we expect selection markers around selected text
        expect(result).toBe('Select <selection>this</selection> text\n');
      });

      it('should handle selection across multiple blocks', () => {
        editor.selection = {
          anchor: { offset: 6, path: [0, 0] },
          focus: { offset: 6, path: [1, 0] },
        };

        const slateNodes = [
          {
            children: [{ text: 'First paragraph' }],
            type: 'p',
          },
          {
            children: [{ text: 'Second paragraph' }],
            type: 'p',
          },
        ];

        const result = serializeMd(editor as any, {
          value: slateNodes,
          withSelection: true,
        });

        // This test will fail initially - we expect selection markers across blocks
        expect(result).toBe(
          'First <selection>paragraph\n\nSecond</selection> paragraph\n'
        );
      });

      it('should not include selection markers when withSelection is false', () => {
        editor.selection = {
          anchor: { offset: 3, path: [0, 0] },
          focus: { offset: 8, path: [0, 0] },
        };

        const slateNodes = [
          {
            children: [{ text: 'Normal text' }],
            type: 'p',
          },
        ];

        const result = serializeMd(editor as any, {
          value: slateNodes,
          withSelection: false,
        });

        // This test should pass - no selection markers expected
        expect(result).toBe('Normal text\n');
      });

      it('should preserve selection with formatted text', () => {
        editor.selection = {
          anchor: { offset: 7, path: [0, 0] },
          focus: { offset: 4, path: [0, 1] },
        };

        const slateNodes = [
          {
            children: [
              { text: 'Normal ' },
              { bold: true, text: 'bold' },
              { text: ' and ' },
              { italic: true, text: 'italic' },
            ],
            type: 'p',
          },
        ];

        const result = serializeMd(editor as any, {
          value: slateNodes,
          withSelection: true,
        });

        // This test will fail initially - selection should work with formatting
        expect(result).toBe(
          'Normal <selection>**bold**</selection> and _italic_\n'
        );
      });
    });

    it('should handle selection in lists', () => {
      editor.selection = {
        anchor: { offset: 0, path: [0, 0] },
        focus: { offset: 6, path: [1, 0] },
      };

      const slateNodes = [
        {
          children: [{ text: 'Item 1' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'p',
        },
        {
          children: [{ text: 'Item 2' }],
          indent: 1,
          listStyleType: 'disc',
          type: 'p',
        },
      ];

      const result = serializeMd(editor as any, {
        value: slateNodes,
        withSelection: true,
      });

      // This test will fail initially - selection should work in lists
      expect(result).toBe('* <selection>Item 1\n* Item 2</selection>\n');
    });

    it('should handle selection in blockquotes', () => {
      editor.selection = {
        anchor: { offset: 6, path: [0, 0, 0] },
        focus: { offset: 11, path: [0, 0, 0] },
      };

      const slateNodes = [
        {
          children: [
            {
              children: [{ text: 'Quote text' }],
              type: 'p',
            },
          ],
          type: 'blockquote',
        },
      ];

      const result = serializeMd(editor as any, {
        value: slateNodes,
        withSelection: true,
      });

      // This test will fail initially - collapsed selection in blockquote
      expect(result).toBe('> Quote <selection>text</selection>\n');
    });

    it('should handle selection with links', () => {
      editor.selection = {
        anchor: { offset: 0, path: [0, 1, 0] },
        focus: { offset: 4, path: [0, 1, 0] },
      };

      const slateNodes = [
        {
          children: [
            { text: 'Text with ' },
            {
              children: [{ text: 'link' }],
              type: 'a',
              url: 'https://example.com',
            },
            { text: ' here' },
          ],
          type: 'p',
        },
      ];

      const result = serializeMd(editor as any, {
        value: slateNodes,
        withSelection: true,
      });

      expect(result).toBe(
        'Text with <selection>[link](https://example.com)</selection> here\n'
      );
    });
  });
});
