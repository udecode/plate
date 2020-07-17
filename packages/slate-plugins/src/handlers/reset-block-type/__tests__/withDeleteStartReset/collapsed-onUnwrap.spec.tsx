/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_BLOCKQUOTE } from '../../../../elements/index';
import { withDeleteStartReset } from '../../index';

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
  const editor = withDeleteStartReset({
    types: [ELEMENT_BLOCKQUOTE],
    onUnwrap,
  })(input as Editor);

  editor.deleteBackward('character');

  expect(onUnwrap).toBeCalled();
});
