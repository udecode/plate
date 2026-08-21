/** @jsx jsxt */

import { createPlateEditor } from '@platejs/core/react';
import { createEditor, type Value } from '@platejs/plite';
import { jsxt, type TestEditor } from '@platejs/test-utils';

import { SingleLinePlugin } from './SingleLinePlugin';

jsxt;

const input = (
  <editor>
    <hp>first block</hp>
    <hp>second block</hp>
    <hp>third block</hp>
  </editor>
) as TestEditor;

const output = (
  <editor>
    <hp>first blocksecond blockthird block</hp>
  </editor>
) as TestEditor;

describe('SingleLinePlugin', () => {
  it('merge all blocks into the first block', () => {
    const editor = createPlateEditor({
      editor: createEditor<Value>(),
      plugins: [SingleLinePlugin],
      initialValue: input.children,
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual(output.children);
  });

  it('filter out line break characters from text', () => {
    const inputWithLineBreaks = (
      <editor>
        <hp>
          text{'\n'}with{'\r'}line{'\r\n'}breaks{'\u2028'}and{'\u2029'}
          separators
        </hp>
      </editor>
    ) as TestEditor;

    const expectedOutput = (
      <editor>
        <hp>textwithlinebreaksandseparators</hp>
      </editor>
    ) as TestEditor;

    const editor = createPlateEditor({
      editor: createEditor<Value>(),
      plugins: [SingleLinePlugin],
      initialValue: inputWithLineBreaks.children,
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual(expectedOutput.children);
  });

  it('prevent insertBreak', () => {
    const singleLineInput = (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    );

    const editor = createPlateEditor({
      editor: createEditor<Value>(),
      plugins: [SingleLinePlugin],
      selection: singleLineInput.selection,
      initialValue: singleLineInput.children,
    });

    editor.update.break.insert();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'test' }], type: 'paragraph' },
    ]);
  });

  it('prevent insertSoftBreak', () => {
    const singleLineInput = (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    );

    const editor = createPlateEditor({
      editor: createEditor<Value>(),
      plugins: [SingleLinePlugin],
      selection: singleLineInput.selection,
      initialValue: singleLineInput.children,
    });

    editor.update.break.insertSoft();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'test' }], type: 'paragraph' },
    ]);
  });

  it('handle empty blocks correctly', () => {
    const emptyBlocksInput = (
      <editor>
        <hp>content</hp>
        <hp />
        <hp>more content</hp>
      </editor>
    ) as TestEditor;

    const expectedOutput = (
      <editor>
        <hp>contentmore content</hp>
      </editor>
    ) as TestEditor;

    const editor = createPlateEditor({
      editor: createEditor<Value>(),
      plugins: [SingleLinePlugin],
      initialValue: emptyBlocksInput.children,
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual(expectedOutput.children);
  });
});
