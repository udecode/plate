/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { createCodeBlockPlugin } from './createCodeBlockPlugin';

import { createPlateUIEditor } from '@/plate/createPlateUIEditor';

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
      ) as any as PlateEditor;

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
      ) as any as PlateEditor;

      const editor = createPlateUIEditor({
        editor: input,
        plugins: [createCodeBlockPlugin()],
      });

      editor.insertBreak();

      expect(input.children).toEqual(output.children);
    });
  });
});
