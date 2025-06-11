/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { createSlatePlugin } from 'platejs';
import { BaseParagraphPlugin } from 'platejs';
import { createPlateEditor } from 'platejs/react';

import { CodeBlockPlugin } from './CodeBlockPlugin';

jsxt;

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
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>test</hcodeline>
          </hcodeblock>
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [
          BaseParagraphPlugin,
          CodeBlockPlugin,
          createSlatePlugin({
            key: 'a',
            parser: {
              format: 'text/plain',
              deserialize() {
                return [{ text: 'test' }];
              },
            },
          }),
        ],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertData({
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
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>test</hcodeline>
          </hcodeblock>
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [BaseParagraphPlugin, CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertData({
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
      ) as any as SlateEditor;

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
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [BaseParagraphPlugin, CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.deleteBackward();
      expect(editor.children).toEqual(output.children);
    });
  });
});
