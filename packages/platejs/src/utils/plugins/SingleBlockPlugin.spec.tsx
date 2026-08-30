/** @jsx jsxt */

import { getPlateRuntime } from 'platejs';
import { createEditor } from 'platejs/react';
import { createEditor as createPliteEditor, type Value } from 'plitejs';
import { jsxt, type TestEditor } from 'plitejs/testing';

import { createEditorWithEditor } from '../../react/editor/withPlate';
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
    const editor = createEditorWithEditor(createPliteEditor<Value>(), {
      plugins: [SingleBlockPlugin],
      selection: input.selection,
      initialValue: input.children,
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual(output.children);
  });

  it('convert hard breaks to soft breaks', () => {
    const innerInput = (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    );
    const editor = createEditorWithEditor(createPliteEditor<Value>(), {
      plugins: [SingleBlockPlugin],
      selection: innerInput.selection,
      initialValue: innerInput.children,
    });

    editor.update.break.insert();

    expect(editor.read.children()).toEqual([
      { children: [{ text: 'test\n' }], type: 'paragraph' },
    ]);
  });

  it('handle single block without changes', () => {
    const singleBlockInput = (
      <editor>
        <hp>single block content</hp>
      </editor>
    ) as TestEditor;

    const editor = createEditorWithEditor(createPliteEditor<Value>(), {
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

    const editor = createEditorWithEditor(createPliteEditor<Value>(), {
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

    const editor = createEditorWithEditor(createPliteEditor<Value>(), {
      plugins: [SingleBlockPlugin],
      initialValue: emptyBlocksInput.children,
    });

    editor.update.value.repair();

    expect(editor.read.children()).toEqual(expectedOutput.children);
  });

  it.each([
    [SingleBlockPlugin, 'singleBlock'],
    [SingleLinePlugin, 'singleLine'],
  ] as const)(
    '%s weakly disables trailing blocks regardless of plugin order',
    (plugin, name) => {
      for (const plugins of [
        [plugin, TrailingBlockPlugin],
        [TrailingBlockPlugin, plugin],
      ]) {
        const editor = createEditor({ plugins });

        expect(getPlateRuntime(editor).plugins[name]).toBeDefined();
        expect(
          getPlateRuntime(editor).plugins[TrailingBlockPlugin.name]
        ).toBeUndefined();
      }
    }
  );
});
