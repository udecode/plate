/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createEditor, createSlateEditor } from 'platejs';

import { SingleBlockPlugin } from './SingleBlockPlugin';

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
    <hp>
      first block{'\n'}second block{'\n'}third block
    </hp>
  </editor>
) as any;

describe('SingleBlockPlugin', () => {
  it('should merge all blocks into the first block with soft breaks', () => {
    const editor = createSlateEditor({
      plugins: [SingleBlockPlugin],
      selection: input.selection,
      value: input.children,
    });

    editor.tf.normalize({ force: true });

    expect(editor.children).toEqual(output.children);
  });

  it('should convert hard breaks to soft breaks', () => {
    const input = (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    );
    const editor = createSlateEditor({
      plugins: [SingleBlockPlugin],
      selection: input.selection,
      value: input.children,
    });

    // Simulate pressing Enter
    editor.tf.insertBreak();

    // Should have inserted a soft break instead
    expect(editor.children).toEqual([
      { children: [{ text: 'test\n' }], type: 'p' },
    ]);
  });

  it('should handle single block without changes', () => {
    const singleBlockInput = createEditor(
      (
        <editor>
          <hp>single block content</hp>
        </editor>
      ) as any
    );

    const editor = createSlateEditor({
      plugins: [SingleBlockPlugin],
      value: singleBlockInput.children,
    });

    editor.tf.normalize({ force: true });

    // Should remain unchanged
    expect(editor.children).toEqual(singleBlockInput.children);
  });

  it('should preserve existing line breaks in text', () => {
    const inputWithLineBreaks = createEditor(
      (
        <editor>
          <hp>line one{'\n'}line two</hp>
          <hp>block two</hp>
        </editor>
      ) as any
    );

    const expectedOutput = (
      <editor>
        <hp>
          line one{'\n'}line two{'\n'}block two
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [SingleBlockPlugin],
      value: inputWithLineBreaks.children,
    });

    editor.tf.normalize({ force: true });

    expect(editor.children).toEqual(expectedOutput.children);
  });

  it('should handle empty blocks correctly', () => {
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
        <hp>
          content{'\n'}
          {'\n'}more content
        </hp>
      </editor>
    ) as any;

    const editor = createSlateEditor({
      plugins: [SingleBlockPlugin],
      value: emptyBlocksInput.children,
    });

    editor.tf.normalize({ force: true });

    expect(editor.children).toEqual(expectedOutput.children);
  });
});
