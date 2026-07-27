/** @jsx jsxt */

import { createBaseEditor } from '@platejs/core';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { CodeBlockPlugin } from './CodeBlockPlugin';

jsxt;

describe('toggle code block', () => {
  it('turn a p to a code block', () => {
    const input = (
      <editor>
        <hp>
          line 1
          <cursor />
        </hp>
        <hp>line 2</hp>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            line 1
            <cursor />
          </hcodeline>
        </hcodeblock>
        <hp>line 2</hp>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.codeBlock.toggle();

    expect(editor.read.children()).toEqual(output.children);
  });

  it('turn a p with a selection to code block', () => {
    const input = (
      <editor>
        <hp>
          Planetas <anchor />
          mori in
          <focus /> gandavum!
        </hp>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            Planetas <anchor />
            mori in
            <focus /> gandavum!
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.codeBlock.toggle();

    expect(editor.read.children()).toEqual(output.children);
  });

  it('turn multiple p to a code block', () => {
    const input = (
      <editor>
        <hp>
          line <anchor />1
        </hp>
        <hp>line 2</hp>
        <hp>
          <focus />
          line 3
        </hp>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            line <anchor />1
          </hcodeline>
          <hcodeline>line 2</hcodeline>
          <hcodeline>
            <focus />
            line 3
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const editor = createBaseEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.codeBlock.toggle();

    expect(editor.read.children()).toEqual(output.children);
  });

  it('turn a code block into paragraphs', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            one
            <cursor />
          </hcodeline>
          <hcodeline>two</hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;
    const output = (
      <editor>
        <hp>
          one
          <cursor />
        </hp>
        <hp>two</hp>
      </editor>
    ) as TestEditor;
    const editor = createBaseEditor({
      plugins: [CodeBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.codeBlock.toggle();

    expect(editor.read.children()).toEqual(output.children);
  });

  it('uses a selection written earlier in the same transaction', () => {
    const input = (
      <editor>
        <hp>
          line 1
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;
    const editor = createBaseEditor({
      plugins: [CodeBlockPlugin],
      initialValue: input.children,
    });

    editor.update((tx) => {
      tx.selection.set(input.selection!);
      tx.codeBlock.toggle();
    });

    expect(editor.read.children()[0]).toMatchObject({ type: 'code_block' });
  });
});
