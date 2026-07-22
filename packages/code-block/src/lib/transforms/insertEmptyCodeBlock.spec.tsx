/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { CodeBlockPlugin } from '../../react/CodeBlockPlugin';
import { insertEmptyCodeBlock } from './insertEmptyCodeBlock';

jsxt;

describe('insert empty code block', () => {
  it('insert empty code block on selected empty line', () => {
    const input = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update((tx) => {
      insertEmptyCodeBlock(editor, tx);
    });

    expect(editor.read.children()).toEqual(output.children);
  });

  it('insert empty code block below selected non-empty line', () => {
    const input = (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hp>test</hp>
        <hcodeblock>
          <hcodeline>
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update((tx) => {
      insertEmptyCodeBlock(editor, tx);
    });

    expect(editor.read.children()).toEqual(output.children);
  });

  it('converts the inserted block when targeting an explicit block', () => {
    const input = (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hp>test</hp>
        <hcodeblock>
          <hcodeline>
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update((tx) => {
      insertEmptyCodeBlock(editor, tx, {
        insertNodesOptions: { at: [0], select: false },
      });
    });

    expect(editor.read.children()).toEqual(output.children);
  });

  it('insert empty code block below expanded selection', () => {
    const input = (
      <editor>
        <hp>line 1</hp>
        <hp>
          line <anchor />2
        </hp>
        <hp>line 3</hp>
        <hp>
          line 4<focus />
        </hp>
        <hp>line 5</hp>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hp>line 1</hp>
        <hp>line 2</hp>
        <hp>line 3</hp>
        <hp>line 4</hp>
        <hcodeblock>
          <hcodeline>
            <cursor />
          </hcodeline>
        </hcodeblock>
        <hp>line 5</hp>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update((tx) => {
      insertEmptyCodeBlock(editor, tx);
    });

    expect(editor.read.children()).toEqual(output.children);
  });
});
