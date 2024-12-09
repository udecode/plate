/** @jsx jsxt */

import {
  type SlateEditor,
  type TElementEntry,
  getNodeEntry,
} from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';
import { jsxt } from '@udecode/plate-test-utils';

import { CodeBlockPlugin } from '../../react/CodeBlockPlugin';
import { outdentCodeLine } from './outdentCodeLine';

jsxt;

describe('outdent code line', () => {
  describe('when line is indented', () => {
    it('should outdent line', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>{'    '}test</hcodeline>
          </hcodeblock>
        </editor>
      ) as any as SlateEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>{'  '}test</hcodeline>
          </hcodeblock>
        </editor>
      ) as any as SlateEditor;

      const editor = createPlateEditor({
        editor: input,
        plugins: [CodeBlockPlugin],
      });

      const codeBlock = getNodeEntry(editor, [0]) as TElementEntry;
      const codeLine = getNodeEntry(editor, [0, 0]) as TElementEntry;

      outdentCodeLine(editor, { codeBlock, codeLine });

      expect(input.children).toEqual(output.children);
    });
  });

  describe('when line is not indented', () => {
    it('should do nothing', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>test</hcodeline>
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
        editor: input,
        plugins: [CodeBlockPlugin],
      });

      const codeBlock = getNodeEntry(editor, [0]) as TElementEntry;
      const codeLine = getNodeEntry(editor, [0, 0]) as TElementEntry;

      outdentCodeLine(editor, { codeBlock, codeLine });

      expect(input.children).toEqual(output.children);
    });
  });
});
