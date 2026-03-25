/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createEditor, createSlateEditor } from 'platejs';

import { SingleLinePlugin } from './SingleLinePlugin';

jsxt;

const input = createEditor(
  (
    <editor>
      <hp>first block</hp>
      <hp>second block</hp>
      <hp>third block</hp>
    </editor>
  ) as any
);

const output = (
  <editor>
    <hp>first blocksecond blockthird block</hp>
  </editor>
) as any;

describe('SingleLinePlugin', () => {
  it('disables the trailing block plugin while enabled', () => {
    const editor = createSlateEditor({
      plugins: [SingleLinePlugin],
      value: [{ type: 'p', children: [{ text: 'test' }] }] as any,
    });

    expect(editor.getPlugin(SingleLinePlugin).override.enabled).toEqual({
      trailingBlock: false,
    });
  });

  it('merge all blocks into the first block', () => {
    const editor = createSlateEditor({
      plugins: [SingleLinePlugin],
      value: input.children,
    });

    editor.tf.normalize({ force: true });

    expect(editor.children).toEqual(output.children);
  });

  it('filter out line break characters from text', () => {
    const inputWithLineBreaks = createEditor(
      (
        <editor>
          <hp>
            text{'\n'}with{'\r'}line{'\r\n'}breaks{'\u2028'}and{'\u2029'}
            separators
          </hp>
        </editor>
      ) as any
    );

    const expectedOutput = (
      <editor>
        <hp>textwithlinebreaksandseparators</hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [SingleLinePlugin],
      value: inputWithLineBreaks.children,
    });

    editor.tf.normalize({ force: true });

    expect(editor.children).toEqual(expectedOutput.children);
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

    const editor = createSlateEditor({
      plugins: [SingleLinePlugin],
      selection: singleLineInput.selection,
      value: singleLineInput.children,
    });

    editor.tf.insertBreak();

    // Should remain unchanged
    expect(editor.children).toEqual([
      { children: [{ text: 'test' }], type: 'p' },
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

    const editor = createSlateEditor({
      plugins: [SingleLinePlugin],
      selection: singleLineInput.selection,
      value: singleLineInput.children,
    });

    editor.tf.insertSoftBreak();

    // Should remain unchanged
    expect(editor.children).toEqual([
      { children: [{ text: 'test' }], type: 'p' },
    ]);
  });

  it('handle empty blocks correctly', () => {
    const emptyBlocksInput = createEditor(
      (
        <editor>
          <hp>content</hp>
          <hp />
          <hp>more content</hp>
        </editor>
      ) as any
    );

    const expectedOutput = (
      <editor>
        <hp>contentmore content</hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [SingleLinePlugin],
      value: emptyBlocksInput.children,
    });

    editor.tf.normalize({ force: true });

    expect(editor.children).toEqual(expectedOutput.children);
  });
});
