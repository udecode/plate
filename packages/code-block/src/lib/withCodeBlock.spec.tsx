/** @jsx jsxt */

import { BaseParagraphPlugin, createBaseEditor } from '@platejs/core';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { BaseCodeBlockPlugin } from './BaseCodeBlockPlugin';

jsxt;

const createEditor = ({ input }: { input: TestEditor }) =>
  createBaseEditor({
    plugins: [BaseParagraphPlugin, BaseCodeBlockPlugin],
    selection: input.selection,
    value: input.children,
  });

describe('insert break', () => {
  describe('when cursor is inside code line', () => {
    it('insert a new code line with same indentation', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              {'    '}before
              <cursor />
              after
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>{'    '}before</hcodeline>
            <hcodeline>
              {'    '}
              <cursor />
              after
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createEditor({ input });

      editor.update.break.insert();

      expect(editor.read.children()).toEqual(output.children);
    });

    it('replaces an expanded selection with a code-local line split', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              ab
              <anchor />
              cd
              <focus />
              ef
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>ab</hcodeline>
            <hcodeline>
              <cursor />
              ef
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createEditor({ input });

      editor.update.break.insert();

      expect(editor.read.children()).toEqual(output.children);
      expect(output.selection).toEqual(editor.read.selection());
    });

    it('keeps leading whitespace when splitting inside indentation', () => {
      const input = (
        <editor>
          <hcodeblock>
            <hcodeline>
              {'  '}
              <cursor />
              {'  '}before
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const output = (
        <editor>
          <hcodeblock>
            <hcodeline>{'      '}</hcodeline>
            <hcodeline>
              <cursor />
              {'  '}before
            </hcodeline>
          </hcodeblock>
        </editor>
      ) as TestEditor;

      const editor = createEditor({ input });

      editor.update.break.insert();

      expect(editor.read.children()).toEqual(output.children);
      expect(output.selection).toEqual(editor.read.selection());
    });
  });
});

describe('resetBlock', () => {
  it('unwraps a code block into paragraphs', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <cursor />
            aa
          </hcodeline>
          <hcodeline>bb</hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hp>
          <cursor />
          aa
        </hp>
        <hp>bb</hp>
      </editor>
    ) as TestEditor;

    const editor = createEditor({ input });

    editor.update.code_block.resetBlock();

    expect(editor.read.children()).toEqual(output.children);
  });
});

describe('deleteBackward', () => {
  it('keeps deleteBackward local at the start of a non-empty first code line', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <cursor />
            aa
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const editor = createEditor({ input });

    editor.update.text.deleteBackward();

    expect(editor.read.children()).toEqual(input.children);
    expect(input.selection).toEqual(editor.read.selection());
  });

  it('merges an empty non-first code line into the previous line', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>aa</hcodeline>
          <hcodeline>
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            aa
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const editor = createEditor({ input });

    editor.update.text.deleteBackward();

    expect(editor.read.children()).toEqual(output.children);
    expect(output.selection).toEqual(editor.read.selection());
  });

  it('unwraps an empty code block to a plain paragraph', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <cursor />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hp>
          <cursor />
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createEditor({ input });

    editor.update.text.deleteBackward();

    expect(editor.read.children()).toEqual(output.children);
    expect(output.selection).toEqual(editor.read.selection());
  });
});

describe('selectAll', () => {
  it('expands the selection to the whole code block', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            be
            <anchor />
            fo
            <focus />
            re
          </hcodeline>
          <hcodeline>after</hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const editor = createEditor({ input });

    editor.update.code_block.selectAll();

    expect(editor.read.selection()).toEqual({
      anchor: { offset: 0, path: [0, 0, 0] },
      focus: { offset: 5, path: [0, 1, 0] },
    });
  });

  it('falls through after the whole code block is selected', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <anchor />
            before
          </hcodeline>
          <hcodeline>
            after
            <focus />
          </hcodeline>
        </hcodeblock>
        <hp>outside</hp>
      </editor>
    ) as TestEditor;

    const editor = createEditor({ input });

    expect(editor.runtime.shortcuts['code_block.selectAll']?.keys).toBe(
      'mod+a'
    );
    expect(editor.update.code_block.selectAll()).toBe(false);
    expect(input.selection).toEqual(editor.read.selection());
  });
});

describe('tab', () => {
  it('indents every selected code line', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <anchor />
            aa
          </hcodeline>
          <hcodeline>
            bb
            <focus />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            {'  '}
            aa
          </hcodeline>
          <hcodeline>
            {'  '}
            bb
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const editor = createEditor({ input });

    expect(editor.update.code_block.tab({ reverse: false })).toBe(true);
    expect(editor.read.children()).toEqual(output.children);
  });

  it('outdents every selected code line when reversed', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            <anchor />
            {'  '}aa
          </hcodeline>
          <hcodeline>
            {'  '}bb
            <focus />
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>aa</hcodeline>
          <hcodeline>bb</hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const editor = createEditor({ input });

    expect(editor.update.code_block.tab({ reverse: true })).toBe(true);
    expect(editor.read.children()).toEqual(output.children);
  });

  it('inserts spaces at a collapsed cursor after code text', () => {
    const input = (
      <editor>
        <hcodeblock>
          <hcodeline>
            aa
            <cursor />
            bb
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const output = (
      <editor>
        <hcodeblock>
          <hcodeline>
            aa{'  '}
            <cursor />
            bb
          </hcodeline>
        </hcodeblock>
      </editor>
    ) as TestEditor;

    const editor = createEditor({ input });

    expect(editor.update.code_block.tab()).toBe(true);
    expect(editor.read.children()).toEqual(output.children);
    expect(output.selection).toEqual(editor.read.selection());
  });
});
