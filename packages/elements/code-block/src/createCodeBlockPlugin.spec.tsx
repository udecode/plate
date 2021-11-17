/** @jsx jsx */

import {
  createDeserializeHtmlPlugin,
  createPlateUIEditor,
} from '@udecode/plate';
import { PlateEditor } from '@udecode/plate-core';
import { createParagraphPlugin } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';
import { createCodeBlockPlugin } from './createCodeBlockPlugin';

jsx;

describe('code block deserialization', () => {
  describe('when selection in code line', () => {
    it('should disable all deserializers except the ast serializer', () => {
      const input = ((
        <editor>
          <hcodeblock>
            <hcodeline>
              <htext />
              <cursor />
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any) as PlateEditor;

      const output = ((
        <editor>
          <hcodeblock>
            <hcodeline>test</hcodeline>
          </hcodeblock>
        </editor>
      ) as any) as PlateEditor;

      const editor = createPlateUIEditor({
        editor: input,
        plugins: [
          createParagraphPlugin(),
          createCodeBlockPlugin(),
          {
            key: 'a',
            editor: {
              insertData: {
                format: 'text/plain',
                getFragment: () => [{ text: 'test' }],
              },
            },
          },
          createDeserializeHtmlPlugin(),
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
      const input = ((
        <editor>
          <hp>
            <cursor />
          </hp>
        </editor>
      ) as any) as PlateEditor;

      const output = ((
        <editor>
          <hcodeblock>
            <hcodeline>test</hcodeline>
          </hcodeblock>
        </editor>
      ) as any) as PlateEditor;

      const editor = createPlateUIEditor({
        editor: input,
        plugins: [
          createParagraphPlugin(),
          createCodeBlockPlugin(),
          createDeserializeHtmlPlugin(),
        ],
      });

      editor.insertData({
        getData: () => `<pre><code>test</code></pre>`,
      } as any);

      expect(editor.children).toEqual(output.children);
    });
  });
});
