/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { createPlateEditor } from 'platejs/react';

import { SingleLinePlugin } from './SingleLinePlugin';

jsxt;

const input = (
  <editor>
    <hp>first block</hp>
    <hp>second block</hp>
    <hp>third block</hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>first blocksecond blockthird block</hp>
  </editor>
) as any;

describe('SingleLinePlugin', () => {
  it('disables the trailing block plugin while enabled', () => {
    expect(SingleLinePlugin.override.enabled).toEqual({
      trailingBlock: false,
    });
  });

  it('merge all blocks into the first block', () => {
    const editor = createPlateEditor({
      plugins: [SingleLinePlugin],
      value: input.children,
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual(output.children);
  });

  it('filter out line break characters from text', () => {
    const inputWithLineBreaks = (
      <editor>
        <hp>
          text{'\n'}with{'\r'}line{'\r\n'}breaks{'\u2028'}and{'\u2029'}
          separators
        </hp>
      </editor>
    ) as any;

    const expectedOutput = (
      <editor>
        <hp>textwithlinebreaksandseparators</hp>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      plugins: [SingleLinePlugin],
      value: inputWithLineBreaks.children,
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual(
      expectedOutput.children
    );
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
      plugins: [SingleLinePlugin],
      selection: singleLineInput.selection,
      value: singleLineInput.children,
    });

    editor.update((tx) => {
      tx.break.insert();
    });

    expect(editor.read((state) => state.value.root())).toEqual([
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

    const editor = createPlateEditor({
      plugins: [SingleLinePlugin],
      selection: singleLineInput.selection,
      value: singleLineInput.children,
    });

    editor.update((tx) => {
      tx.break.insertSoft();
    });

    expect(editor.read((state) => state.value.root())).toEqual([
      { children: [{ text: 'test' }], type: 'p' },
    ]);
  });

  it('handle empty blocks correctly', () => {
    const emptyBlocksInput = (
      <editor>
        <hp>content</hp>
        <hp />
        <hp>more content</hp>
      </editor>
    ) as any;

    const expectedOutput = (
      <editor>
        <hp>contentmore content</hp>
      </editor>
    ) as any;

    const editor = createPlateEditor({
      plugins: [SingleLinePlugin],
      value: emptyBlocksInput.children,
    });

    editor.update((tx) => {
      tx.normalize({ force: true });
    });

    expect(editor.read((state) => state.value.root())).toEqual(
      expectedOutput.children
    );
  });
});
