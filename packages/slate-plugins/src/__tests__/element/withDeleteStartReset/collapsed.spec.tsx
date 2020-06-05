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

const output = (
  <editor>
    <hp>
      <htext />
    </hp>
  </editor>
) as any;

it('should set the node to paragraph', () => {
  const editor = withDeleteStartReset({ types: [BLOCKQUOTE] })(input as Editor);

  editor.deleteBackward('character');

  expect(editor.children).toEqual(output.children);
});
