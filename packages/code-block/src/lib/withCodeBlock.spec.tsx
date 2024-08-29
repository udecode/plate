/** @jsx jsx */

import type { SlateEditor } from '@udecode/plate-common';

import { createPlateEditor } from '@udecode/plate-common/react';
import { jsx } from '@udecode/plate-test-utils';

import { CodeBlockPlugin } from '../react/CodeBlockPlugin';

jsx;

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
        editor: input,
        plugins: [CodeBlockPlugin],
      });

      editor.insertBreak();

      expect(input.children).toEqual(output.children);
    });
  });
});
