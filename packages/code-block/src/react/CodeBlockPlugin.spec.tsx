/** @jsx jsxt */

import {
  BaseParagraphPlugin,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { CodeBlockPlugin } from './CodeBlockPlugin';

jsxt;

describe('code block deserialization', () => {
  describe('when selection in code line', () => {
    it('disable all deserializers except the ast serializer', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>test</hcodeline>
          </hcodeblock>
        </editor>
      ) as any as TestEditor;

      const editor = createBaseEditor({
        plugins: [
          BaseParagraphPlugin,
          CodeBlockPlugin,
          createBasePlugin({
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

      editor.api.clipboard.insertData({
        getData: () => `<pre><code>test</code></pre>`,
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('when selection outside of code line', () => {
    it('does not affect deserialization', () => {
      const input = (
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>test</hcodeline>
          </hcodeblock>
        </editor>
      ) as any as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseParagraphPlugin, CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.api.clipboard.insertData({
        getData: (format: string) =>
          format === 'text/html' && `<pre><code>test</code></pre>`,
      } as any);

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('deleting lines after the codeblock', () => {
    it('normalizes inserted nodes into code lines', () => {
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
      ) as any as TestEditor;

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
      ) as any as TestEditor;

      const editor = createBaseEditor({
        plugins: [BaseParagraphPlugin, CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.update.text.deleteBackward();
      expect(editor.read.children()).toEqual(output.children);
    });
  });
});
