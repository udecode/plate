/** @jsx jsx */

import {
  getNodeEntry,
  PlateEditor,
  TElementEntry,
} from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { createPlateUIEditor } from '../../../../ui/plate/src/utils/createPlateUIEditor';
import { createCodeBlockPlugin } from '../createCodeBlockPlugin';
import { outdentCodeLine } from './outdentCodeLine';

jsx;

describe('outdent code line', () => {
  describe('when line is indented', () => {
    it('should outdent line', () => {
      const input = ((
        <editor>
          <hcodeblock>
            <hcodeline>{'    '}test</hcodeline>
          </hcodeblock>
        </editor>
      ) as any) as PlateEditor;

      const output = ((
        <editor>
          <hcodeblock>
            <hcodeline>{'  '}test</hcodeline>
          </hcodeblock>
        </editor>
      ) as any) as PlateEditor;

      const editor = createPlateUIEditor({
        editor: input,
        plugins: [createCodeBlockPlugin()],
      });

      const codeBlock = getNodeEntry(editor, [0]) as TElementEntry;
      const codeLine = getNodeEntry(editor, [0, 0]) as TElementEntry;

      outdentCodeLine(editor, { codeBlock, codeLine });

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when line is not indented', () => {
    it('should do nothing', () => {
      const input = ((
        <editor>
          <hcodeblock>
            <hcodeline>test</hcodeline>
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
        plugins: [createCodeBlockPlugin()],
      });

      const codeBlock = getNodeEntry(editor, [0]) as TElementEntry;
      const codeLine = getNodeEntry(editor, [0, 0]) as TElementEntry;

      outdentCodeLine(editor, { codeBlock, codeLine });

      expect(input.children).toEqual(output.children);
    });
  });
});
