/** @jsx jsxt */

import type { SlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { createPlateEditor } from 'platejs/react';

import { CodeBlockPlugin } from '../react/CodeBlockPlugin';

jsxt;

describe('insert break', () => {
  describe('when cursor is inside code line', () => {
    it('should insert a new code line with same indentation', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              {'    '}before
              <cursor />
              after
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>{'    '}before</hcodeline>
            <hcodeline>
              {'    '}
              <cursor />
              after
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        plugins: [CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.tf.insertBreak();

      expect(editor.children).toEqual(output.children);
    });
  });
});
