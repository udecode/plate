/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('editor.api.descendant', () => {
  it('finds a descendant from the root path', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>one</hp>
          <hp>two</hp>
        </editor>
      ) as any
    );

    expect(editor.api.descendant({ at: [], match: { type: 'p' } })).toEqual([
      { children: [{ text: 'one' }], type: 'p' },
      [0],
    ]);
  });

  it('respects range roots and reverse traversal', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            o<anchor />
            ne
          </hp>
          <hp>
            tw
            <focus />o
          </hp>
        </editor>
      ) as any
    );

    expect(
      editor.api.descendant({
        at: editor.selection!,
        match: (node) => 'text' in node && node.text === 'one',
      })
    ).toEqual([{ text: 'one' }, [0, 0]]);
    expect(
      editor.api.descendant({
        at: editor.selection!,
        match: (node) => 'text' in node && node.text === 'two',
        reverse: true,
      })
    ).toEqual([{ text: 'two' }, [1, 0]]);
  });

  it('skips descendants inside void nodes unless voids is true', () => {
    const editor = createEditor(
      (
        <editor>
          <himg>
            <htext>skip</htext>
          </himg>
          <hp>keep</hp>
        </editor>
      ) as any
    );

    editor.isVoid = (element: any) => element.type === 'img';
    editor.api.isVoid = editor.isVoid as any;

    expect(
      editor.api.descendant({
        at: [],
        match: (node) => 'text' in node,
      })
    ).toEqual([{ text: 'keep' }, [1, 0]]);
    expect(
      editor.api.descendant({
        at: [],
        match: (node) => 'text' in node && node.text === 'skip',
        voids: true,
      })
    ).toEqual([{ text: 'skip' }, [0, 0]]);
  });

  it('returns undefined for missing descendants', () => {
    const editor = createEditor();

    expect(
      editor.api.descendant({ at: [9], match: { type: 'p' } })
    ).toBeUndefined();
  });
});
