/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withBreakEmptyReset } from 'element';
import { BLOCKQUOTE } from 'elements';
import { Editor } from 'slate';

const input = (
  <editor>
    <hblockquote>
      <htext />
      <cursor />
    </hblockquote>
  </editor>
) as any;

it('should be', () => {
  const onUnwrap = jest.fn();
  const editor = withBreakEmptyReset({ types: [BLOCKQUOTE], onUnwrap })(
    input as Editor
  );

  editor.insertBreak();

  expect(onUnwrap).toBeCalled();
});
