/** @jsx jsxt */

import { type SlateEditor, createEditor, createSlateEditor } from 'platejs';
import { jsxt } from '@platejs/test-utils';

import { setAlign } from '.';
import { BaseTextAlignPlugin } from '../BaseTextAlignPlugin';

jsxt;

describe('center', () => {
  const input = createEditor(
    (
      <editor>
        <hp>
          test
          <cursor />
        </hp>
      </editor>
    ) as any
  );

  const output = (
    <editor>
      <hp align="center">test</hp>
    </editor>
  ) as any;

  it('should align center', () => {
    const editor = createSlateEditor({
      plugins: [BaseTextAlignPlugin],
      selection: input.selection,
      value: input.children,
    });

    setAlign(editor, 'center');

    expect(editor.children).toEqual(output.children);
  });
});

describe('left', () => {
  const input = createEditor(
    (
      <editor>
        <hp align="center">
          test
          <cursor />
        </hp>
      </editor>
    ) as any
  );

  const output = (
    <editor>
      <hp>test</hp>
    </editor>
  ) as any;

  it('should remove align prop', () => {
    const editor = createSlateEditor({
      plugins: [BaseTextAlignPlugin],
      selection: input.selection,
      value: input.children,
    });

    setAlign(editor, 'start');

    expect(editor.children).toEqual(output.children);
  });
});

describe('no-type', () => {
  describe('when type (h1) is not in types', () => {
    const input = (
      <editor>
        <hh1>
          test
          <cursor />
        </hh1>
      </editor>
    ) as any as SlateEditor;

    const output = (
      <editor>
        <hh1>test</hh1>
      </editor>
    ) as any as SlateEditor;

    it('should not align', () => {
      const editor = createSlateEditor({
        plugins: [BaseTextAlignPlugin],
        selection: input.selection,
        value: input.children,
      });

      setAlign(editor, 'center');

      expect(editor.children).toEqual(output.children);
    });
  });
});
