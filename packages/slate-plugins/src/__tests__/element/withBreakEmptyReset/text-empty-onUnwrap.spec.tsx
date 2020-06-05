/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { BLOCKQUOTE } from 'elements';
import { Editor } from 'slate';
import { withBreakEmptyReset } from '../../../handlers/reset-block-type';

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
