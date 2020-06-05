/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { BLOCKQUOTE } from 'elements';
import { Editor } from 'slate';
import { withDeleteStartReset } from '../../../handlers/reset-block-type';

const input = (
  <editor>
    <hblockquote>
      <htext />
      <cursor />
    </hblockquote>
  </editor>
) as any;

it('should call onUnwrap', () => {
  const onUnwrap = jest.fn();
  const editor = withDeleteStartReset({ types: [BLOCKQUOTE], onUnwrap })(
    input as Editor
  );

  editor.deleteBackward('character');

  expect(onUnwrap).toBeCalled();
});
