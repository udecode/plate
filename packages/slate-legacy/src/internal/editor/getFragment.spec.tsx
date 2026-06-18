/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('getFragment', () => {
  it('returns an empty array for null or bad paths', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hp>one</hp>
        </editor>
      ) as any
    );

    expect(editor.getFragment(null)).toEqual([]);
    expect(editor.getFragment([9])).toEqual([]);
  });

  it('unwraps configured container node types', () => {
    const editor: any = createEditor(
      (
        <editor>
          <hblockquote>
            <hp>one</hp>
            <hp>two</hp>
          </hblockquote>
        </editor>
      ) as any
    );

    expect(editor.getFragment([0], { unwrap: ['blockquote'] })).toEqual([
      { children: [{ text: 'one' }], type: 'p' },
      { children: [{ text: 'two' }], type: 'p' },
    ]);
  });
});
