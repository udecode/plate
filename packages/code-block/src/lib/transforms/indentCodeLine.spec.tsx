/** @jsx jsxt */

import assert from 'node:assert/strict';
import { createBaseEditor } from '@platejs/core';
import type { Element, Path } from '@platejs/plite';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { CodeBlockPlugin } from '../../react/CodeBlockPlugin';
import { indentCodeLine } from './indentCodeLine';

jsxt;

const getElementEntry = (
  editor: ReturnType<typeof createBaseEditor>,
  path: Path
) => {
  const entry = editor.read.nodes.get<Element>(path);
  assert(entry);

  return entry;
};

describe('indent code line', () => {
  it('does nothing when the code line no longer resolves', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>one</hcodeline>
          <hcodeline>two</hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [CodeBlockPlugin],
      value: input.children,
    });
    const codeBlock = getElementEntry(editor, [0]);
    const codeLine = getElementEntry(editor, [0, 0]);

    editor.update.nodes.remove({ at: codeLine[0] });

    const children = editor.read.children();

    expect(() => {
      editor.update((tx) => {
        indentCodeLine(editor, tx, { codeBlock, codeLine });
      });
    }).not.toThrow();
    expect(editor.read.children()).toEqual(children);
  });

  describe('when the selection is expanded', () => {
    it('indent', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              {'  '}before <anchor />
              selection
              <focus /> after
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>
              {'    '}before <anchor />
              selection
              <focus /> after
            </hcodeline>
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
        indentCodeLine(editor, tx, { codeBlock, codeLine });
      });

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('when the selection is collapsed', () => {
    describe('when there are only whitespace characters left of the cursor', () => {
      it('indent', () => {
        const input = (
          <editor>
            <hcodeblock>
              <hcodeline>
                {'  '}
                <cursor />
                after
              </hcodeline>
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const output = (
          <editor>
            <hcodeblock>
              <hcodeline>
                {'    '}
                <cursor />
                after
              </hcodeline>
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
          indentCodeLine(editor, tx, { codeBlock, codeLine });
        });

        expect(editor.read.children()).toEqual(output.children);
      });
    });

    describe('when there are non-whitespace characters left of the cursor', () => {
      it('insert 2 spaces at the cursor', () => {
        const input = (
          <editor>
            <hcodeblock>
              <hcodeline>
                {'  '}before
                <cursor />
                after
              </hcodeline>
            </hcodeblock>
          </editor>
        ) as TestEditor;

        const output = (
          <editor>
            <hcodeblock>
              <hcodeline>
                {'  '}before{'  '}
                <cursor />
                after
              </hcodeline>
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
          indentCodeLine(editor, tx, { codeBlock, codeLine });
        });

        expect(editor.read.children()).toEqual(output.children);
      });
    });
  });
});
