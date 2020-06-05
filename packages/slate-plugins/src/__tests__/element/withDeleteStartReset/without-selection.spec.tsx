/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { BLOCKQUOTE } from 'elements/blockquote';
import { Editor } from 'slate';
import { withDeleteStartReset } from '../../../handlers/reset-block-type';

const input = (
  <editor>
    <hblockquote>
      <htext />
    </hblockquote>
  </editor>
) as any;

const output = (
  <editor>
    <hblockquote>
      <htext />
    </hblockquote>
  </editor>
) as any;

it('should do nothing', () => {
  const editor = withDeleteStartReset({ types: [BLOCKQUOTE] })(input as Editor);

  editor.deleteBackward('character');

  expect(editor.children).toEqual(output.children);
});
