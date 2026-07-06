/** @jsx jsxt */

import { jsxt, type TestEditor } from '@platejs/test-utils';
import { createPlateEditor } from '@platejs/core/react';

import { SingleBlockPlugin } from './SingleBlockPlugin';

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
    <hp>
      first block{'\n'}second block{'\n'}third block
    </hp>
  </editor>
) as TestEditor;

describe('SingleBlockPlugin', () => {
  it('disables the trailing block plugin while enabled', () => {
    expect(SingleBlockPlugin.override.enabled).toEqual({
      trailingBlock: false,
    });
  });

  it('merge all blocks into the first block with soft breaks', () => {
    const editor = createPlateEditor({
      plugins: [SingleBlockPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.update.normalize({ force: true });

    expect(editor.read.children()).toEqual(output.children);
  });

  it('convert hard breaks to soft breaks', () => {
    const input = (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    );
    const editor = createPlateEditor({
      plugins: [SingleBlockPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.update.break.insert();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'test\n' }], type: 'p' },
    ]);
  });

  it('handle single block without changes', () => {
    const singleBlockInput = (
      <editor>
        <hp>single block content</hp>
      </editor>
    ) as TestEditor;

    const editor = createPlateEditor({
      plugins: [SingleBlockPlugin],
      value: singleBlockInput.children,
    });

    editor.update.normalize({ force: true });

    expect(editor.read.children()).toEqual(singleBlockInput.children);
  });

  it('preserve existing line breaks in text', () => {
    const inputWithLineBreaks = (
      <editor>
        <hp>line one{'\n'}line two</hp>
        <hp>block two</hp>
      </editor>
    ) as TestEditor;

    const expectedOutput = (
      <editor>
        <hp>
          line one{'\n'}line two{'\n'}block two
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createPlateEditor({
      plugins: [SingleBlockPlugin],
      value: inputWithLineBreaks.children,
    });

    editor.update.normalize({ force: true });

    expect(editor.read.children()).toEqual(expectedOutput.children);
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
        <hp>
          content{'\n'}
          {'\n'}more content
        </hp>
      </editor>
    ) as TestEditor;

    const editor = createPlateEditor({
      plugins: [SingleBlockPlugin],
      value: emptyBlocksInput.children,
    });

    editor.update.normalize({ force: true });

    expect(editor.read.children()).toEqual(expectedOutput.children);
  });
});
