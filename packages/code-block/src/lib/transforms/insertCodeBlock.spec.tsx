/** @jsx jsxt */

import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';
import { jsxt, type TestEditor } from '@platejs/test-utils';
import { KEYS } from '@platejs/utils';

import { BaseCodeBlockPlugin } from '../BaseCodeBlockPlugin';
import { CodeBlockPlugin } from '../../react/CodeBlockPlugin';
import { insertCodeBlock } from './insertCodeBlock';

jsxt;

describe('insert code block', () => {
  describe('when selection is at start of block', () => {
    it('turn line to code block', () => {
      const input = (
        <editor>
          <hp>line 1</hp>
          <hp>
            <cursor />
            line 2
          </hp>
          <hp>line 3</hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp>line 1</hp>
          <hcodeblock>
            <hcodeline>
              <cursor />
              line 2
            </hcodeline>
          </hcodeblock>
          <hp>line 3</hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.update((tx) => {
        insertCodeBlock(editor, tx);
      });

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('when selection is not at start of block', () => {
    it('split line at selection and turn latter line to code block', () => {
      const input = (
        <editor>
          <hp>line 1</hp>
          <hp>
            before <cursor />
            after
          </hp>
          <hp>line 3</hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp>line 1</hp>
          <hp>before </hp>
          <hcodeblock>
            <hcodeline>
              <cursor />
              after
            </hcodeline>
          </hcodeblock>
          <hp>line 3</hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.update((tx) => {
        insertCodeBlock(editor, tx);
      });

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  describe('when selection is expanded', () => {
    it('keeps the editor unchanged for expanded selections', () => {
      const input = (
        <editor>
          <hp>line 1</hp>
          <hp>
            before <anchor />
            selection
            <focus />
            after
          </hp>
          <hp>line 3</hp>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hp>line 1</hp>
          <hp>
            before <anchor />
            selection
            <focus />
            after
          </hp>
          <hp>line 3</hp>
        </editor>
      ) as TestEditor;

      const editor = createBaseEditor({
        plugins: [CodeBlockPlugin],
        selection: input.selection,
        value: input.children,
      });

      editor.update((tx) => {
        insertCodeBlock(editor, tx);
      });

      expect(editor.read.children()).toEqual(output.children);
    });
  });

  it('does nothing when there is no selection', () => {
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      value: [{ type: KEYS.p, children: [{ text: 'line 1' }] }],
    });

    editor.update((tx) => {
      insertCodeBlock(editor, tx);
    });

    expect(editor.read.children()).toEqual([
      { type: KEYS.p, children: [{ text: 'line 1' }] },
    ]);
  });

  it('does nothing when the selection is already in a code block', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            before <cursor />
            after
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;
    const editor = createBaseEditor({
      plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
      selection: input.selection,
      value: input.children,
    });
    const before = editor.read.children();

    editor.update((tx) => {
      insertCodeBlock(editor, tx);
    });

    expect(editor.read.children()).toBe(before);
  });
});
