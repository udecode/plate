/** @jsx jsxt */

import type { ElementEntry, SlateEditor } from '@udecode/plate';

import { jsxt } from '@udecode/plate-test-utils';
import { createPlateEditor } from '@udecode/plate/react';

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
        plugins: [CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      const codeBlock = editor.api.node([0]) as ElementEntry;
      const codeLine = editor.api.node([0, 0]) as ElementEntry;

      outdentCodeLine(editor, { codeBlock, codeLine });

      expect(editor.children).toEqual(output.children);
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
        plugins: [CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      const codeBlock = editor.api.node([0]) as ElementEntry;
      const codeLine = editor.api.node([0, 0]) as ElementEntry;

      outdentCodeLine(editor, { codeBlock, codeLine });

      expect(editor.children).toEqual(output.children);
    });
  });
});
