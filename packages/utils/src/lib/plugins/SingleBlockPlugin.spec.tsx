/** @jsx jsxt */

import { jsxt, type TestEditor } from '@platejs/test-utils';
import { createPlateEditor } from '@platejs/core/react';
import { getPlateRuntime } from '@platejs/core/internal';

import { SingleBlockPlugin } from './SingleBlockPlugin';
import { SingleLinePlugin } from './SingleLinePlugin';
import { TrailingBlockPlugin } from './TrailingBlockPlugin';

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
  it('merge all blocks into the first block with soft breaks', () => {
    const editor = createPlateEditor({
      plugins: [SingleBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.value.repair();

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
      initialValue: input.children,
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
      initialValue: singleBlockInput.children,
    });

    editor.update.value.repair();

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
      initialValue: inputWithLineBreaks.children,
    });

    editor.update.value.repair();

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
      initialValue: emptyBlocksInput.children,
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual(expectedOutput.children);
  });

  it.each([
    [SingleBlockPlugin, 'singleBlock'],
    [SingleLinePlugin, 'singleLine'],
  ] as const)('%s weakly disables trailing blocks regardless of plugin order', (plugin, key) => {
    for (const plugins of [
      [plugin, TrailingBlockPlugin],
      [TrailingBlockPlugin, plugin],
    ]) {
      const editor = createPlateEditor({ plugins });

      expect(getPlateRuntime(editor).plugins[key]).toBeDefined();
      expect(
        getPlateRuntime(editor).plugins[TrailingBlockPlugin.key]
      ).toBeUndefined();
    }
  });
});
