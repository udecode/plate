/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { BLOCKQUOTE } from 'elements';
import { Editor } from 'slate';
import { withDeleteStartReset } from '../../../handlers/reset-block-type';

const input = (
  <editor>
    <hblockquote>
      test
      <cursor />
    </hblockquote>
  </editor>
) as any;

const output = (
  <editor>
    <hblockquote>tes</hblockquote>
  </editor>
) as any;

it('should run default deleteBackward', () => {
  const editor = withDeleteStartReset({ types: [BLOCKQUOTE] })(input as Editor);

  editor.deleteBackward('character');

  expect(editor.children).toEqual(output.children);
});
