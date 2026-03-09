/** @jsx jsxt */

import type { ElementEntry, SlateEditor } from 'platejs';

import { jsxt } from '@platejs/test-utils';
import { createSlateEditor } from 'platejs';

import { CodeBlockPlugin } from '../../react/CodeBlockPlugin';
import { outdentCodeLine } from './outdentCodeLine';

jsxt;

describe('outdent code line', () => {
  describe('when line is indented', () => {
    it('outdent line', () => {
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

      const editor = createSlateEditor({
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
    it('keeps an unindented line unchanged', () => {
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

      const editor = createSlateEditor({
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
