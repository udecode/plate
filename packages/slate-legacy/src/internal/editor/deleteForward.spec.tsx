/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('deleteForward', () => {
  it('deletes the next character', () => {
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

    editor.deleteForward();

    const output = (
      <editor>
        <hp>
          wo
          <cursor />d
        </hp>
      </editor>
    ) as any;

    expect(editor.children).toEqual(output.children);
    expect(editor.selection).toEqual(output.selection);
  });
});
