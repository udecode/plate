/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('insertSoftBreak', () => {
  it('inserts a newline at a collapsed selection', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hp>
            one
            <cursor />
            two
          </hp>
        </editor>
      ) as any
    );

    editor.insertSoftBreak();

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: 'one\ntwo' }] },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 4, path: [0, 0] },
      focus: { offset: 4, path: [0, 0] },
    });
  });

  it('replaces an expanded selection before inserting the newline', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hp>
            o
            <anchor />
            ne
            <focus />
            two
          </hp>
        </editor>
      ) as any
    );

    editor.insertSoftBreak();

    expect(editor.children).toEqual([
      { type: 'p', children: [{ text: 'o\ntwo' }] },
    ]);
    expect(editor.selection).toEqual({
      anchor: { offset: 2, path: [0, 0] },
      focus: { offset: 2, path: [0, 0] },
    });
  });
});
