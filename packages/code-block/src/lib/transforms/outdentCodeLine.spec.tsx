/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';
import type { Element } from '@platejs/plite';
import { jsxt, type TestEditor } from '@platejs/test-utils';

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
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>{'  '}test</hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      const codeBlock = editor.read.nodes.get<Element>([0], {
        required: true,
      });
      const codeLine = editor.read.nodes.get<Element>([0, 0], {
        required: true,
      });

      editor.update((tx) => {
        outdentCodeLine(editor, tx, { codeBlock, codeLine });
      });

      expect(editor.read.children()).toEqual(output.children);
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
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>test</hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      const codeBlock = editor.read.nodes.get<Element>([0], {
        required: true,
      });
      const codeLine = editor.read.nodes.get<Element>([0, 0], {
        required: true,
      });

      editor.update((tx) => {
        outdentCodeLine(editor, tx, { codeBlock, codeLine });
      });

      expect(editor.read.children()).toEqual(output.children);
    });
  });
});
