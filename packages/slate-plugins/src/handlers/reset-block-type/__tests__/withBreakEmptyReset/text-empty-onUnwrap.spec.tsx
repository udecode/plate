/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_BLOCKQUOTE } from '../../../../elements/index';
import { withBreakEmptyReset } from '../../index';

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
  const editor = withBreakEmptyReset({ types: [ELEMENT_BLOCKQUOTE], onUnwrap })(
    input as Editor
  );

  editor.insertBreak();

  expect(onUnwrap).toBeCalled();
});
