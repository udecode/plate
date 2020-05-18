/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { withDeleteStartReset } from 'element';
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

it('should call onUnwrap', () => {
  const onUnwrap = jest.fn();
  const editor = withDeleteStartReset({ types: [BLOCKQUOTE], onUnwrap })(
    input as Editor
  );

  editor.deleteBackward('character');

  expect(onUnwrap).toBeCalled();
});
