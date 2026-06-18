/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('deleteBackward', () => {
  it('deletes the previous character', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hp>
            wo
            <cursor />
            rd
          </hp>
        </editor>
      ) as any
    );

    editor.deleteBackward();

    const output = (
      <editor>
        <hp>
          w
          <cursor />
          rd
        </hp>
      </editor>
    ) as any;

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });
});
