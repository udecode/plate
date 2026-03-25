/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';
import { type SlateEditor, createEditor, createSlateEditor } from 'platejs';

import { BaseLineHeightPlugin } from '../BaseLineHeightPlugin';
import { setLineHeight } from './setLineHeight';

jsxt;

describe('setLineHeight', () => {
  it('sets a custom line height on matching blocks', () => {
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

    const editor = createSlateEditor({
      plugins: [BaseLineHeightPlugin],
      selection: input.selection,
      value: input.children,
    } as any);

    setLineHeight(editor, 2);

    expect(editor.children).toEqual([
      {
        children: [{ text: 'test' }],
        lineHeight: 2,
        type: 'p',
      },
    ]);
  });

  it('removes the lineHeight prop when resetting to the default value', () => {
    const input = createEditor(
      (
        <editor>
          <hp lineHeight={2}>
            test
            <cursor />
          </hp>
        </editor>
      ) as any
    );

    const editor = createSlateEditor({
      plugins: [BaseLineHeightPlugin],
      selection: input.selection,
      value: input.children,
    } as any);

    setLineHeight(editor, 1.5);

    expect(editor.children).toEqual([
      {
        children: [{ text: 'test' }],
        type: 'p',
      },
    ]);
  });

  it('does nothing for blocks outside the injected target types', () => {
    const input = (
      <editor>
        <hh1>
          test
          <cursor />
        </hh1>
      </editor>
    ) as any as SlateEditor;

    const editor = createSlateEditor({
      plugins: [BaseLineHeightPlugin],
      selection: input.selection,
      value: input.children,
    } as any);

    setLineHeight(editor, 2);

    expect(editor.children).toEqual([
      {
        children: [{ text: 'test' }],
        type: 'h1',
      },
    ]);
  });
});
