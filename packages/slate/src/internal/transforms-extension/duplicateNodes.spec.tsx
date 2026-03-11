/** @jsx jsx */

import { jsx } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsx;

describe('duplicateNodes', () => {
  it('duplicates the block above the current selection when block is true', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>
            one
            <cursor />
          </hp>
          <hp>two</hp>
        </editor>
      ) as any
    );

    editor.tf.duplicateNodes({ block: true });

    expect(editor.children).toEqual([
      { children: [{ text: 'one' }], type: 'p' },
      { children: [{ text: 'one' }], type: 'p' },
      { children: [{ text: 'two' }], type: 'p' },
    ]);
  });

  it('duplicates the block above an explicit location when block is true', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>one</hp>
          <hp>two</hp>
        </editor>
      ) as any
    );

    editor.tf.duplicateNodes({ at: [1], block: true });

    expect(editor.children).toEqual([
      { children: [{ text: 'one' }], type: 'p' },
      { children: [{ text: 'two' }], type: 'p' },
      { children: [{ text: 'two' }], type: 'p' },
    ]);
  });
});
