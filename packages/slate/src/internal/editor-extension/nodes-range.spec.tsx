/** @jsx jsxt */

import { jsxt } from '@platejs/test-utils';

import { createEditor } from '../../create-editor';

jsxt;

describe('nodesRange', () => {
  it('returns undefined for an empty node entry list', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>one</hp>
        </editor>
      ) as any
    );

    expect(editor.api.nodesRange([] as any)).toBeUndefined();
  });

  it('returns the range spanning the first and last node entries', () => {
    const editor = createEditor(
      (
        <editor>
          <hp>one</hp>
          <hp>two</hp>
          <hp>three</hp>
        </editor>
      ) as any
    );

    const blocks = [
      [editor.children[0], [0]],
      [editor.children[2], [2]],
    ];

    expect(editor.api.nodesRange(blocks as any)).toEqual(
      editor.api.range([0], [2])
    );
  });
});
