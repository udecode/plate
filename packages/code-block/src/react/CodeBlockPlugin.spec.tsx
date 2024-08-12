/** @jsx jsx */

import type { PlateEditor } from '@udecode/plate-common';

import { createPlugin } from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';
import { ParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';

import { CodeBlockPlugin } from './CodeBlockPlugin';

jsx;

describe('code block deserialization', () => {
  describe('when selection in code line', () => {
    it('should disable all deserializers except the ast serializer', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any as PlateEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>test</hcodeline>
          </hcodeblock>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [
          ParagraphPlugin,
          CodeBlockPlugin,
          createPlugin({
            editor: {
              insertData: {
                format: 'text/plain',
                getFragment() {
                  return [{ text: 'test' }];
                },
              },
            },
            key: 'a',
          }),
        ],
      });

      editor.insertData({
        getData: () => `<pre><code>test</code></pre>`,
      } as any);

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('when selection outside of code line', () => {
    it('should not affect deserialization', () => {
      const input = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any as PlateEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>test</hcodeline>
          </hcodeblock>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [ParagraphPlugin, CodeBlockPlugin],
      });

      editor.insertData({
        getData: (format: string) =>
          format === 'text/html' && `<pre><code>test</code></pre>`,
      } as any);

      expect(editor.children).toEqual(output.children);
    });
  });

  describe('deleting lines after the codeblock', () => {
    it('it should normalized inserted nodes into code lines', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>Line 1</hcodeline>
            <hcodeline>
              <cursor />
            </hcodeline>
          </hcodeblock>
          <hp>Line 3</hp>
        </editor>
      ) as any as PlateEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>
              Line 1
              <cursor />
            </hcodeline>
          </hcodeblock>
          <hp>Line 3</hp>
        </editor>
      ) as any as PlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [ParagraphPlugin, CodeBlockPlugin],
      });

      editor.deleteBackward('character');
      expect(editor.children).toEqual(output.children);
    });
  });
});
