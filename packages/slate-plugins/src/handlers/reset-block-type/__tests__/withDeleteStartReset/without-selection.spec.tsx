/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_BLOCKQUOTE } from '../../../../elements/blockquote/index';
import { withDeleteStartReset } from '../../index';

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
  const editor = withDeleteStartReset({ types: [ELEMENT_BLOCKQUOTE] })(
    input as Editor
  );

  editor.deleteBackward('character');

  expect(editor.children).toEqual(output.children);
});
