/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_BLOCKQUOTE } from '../../../../elements/blockquote/index';
import { withBreakEmptyReset } from '../../index';

const input = (
  <editor>
    <hblockquote>
      <htext />
      <cursor />
    </hblockquote>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      <htext />
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  const editor = withBreakEmptyReset({ types: [ELEMENT_BLOCKQUOTE] })(
    input as Editor
  );

  editor.insertBreak();

  expect(editor.children).toEqual(output.children);
});
