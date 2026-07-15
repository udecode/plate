/** @jsx jsxt */

import assert from 'node:assert/strict';
import { createBaseEditor } from '@platejs/core';
import type { Element, Path } from '@platejs/plite';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { CodeBlockPlugin } from '../../react/CodeBlockPlugin';
import { outdentCodeLine } from './outdentCodeLine';

jsxt;

const getElementEntry = (
  editor: ReturnType<typeof createBaseEditor>,
  path: Path
) => {
  const entry = editor.read.nodes.get<Element>(path);
  assert(entry);

  return entry;
};

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

      const codeBlock = getElementEntry(editor, [0]);
      const codeLine = getElementEntry(editor, [0, 0]);

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

      const codeBlock = getElementEntry(editor, [0]);
      const codeLine = getElementEntry(editor, [0, 0]);

      editor.update((tx) => {
        outdentCodeLine(editor, tx, { codeBlock, codeLine });
      });

      expect(editor.read.children()).toEqual(output.children);
    });
  });
});
