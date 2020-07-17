/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_BLOCKQUOTE } from '../../../../elements/index';
import { withDeleteStartReset } from '../../index';

const input = (
  <editor>
    <hblockquote>
      <anchor />t<focus />
      est
    </hblockquote>
  </editor>
) as any;

const output = (
  <editor>
    <hblockquote>test</hblockquote>
  </editor>
) as any;

it('should run default deleteBackward', () => {
  const editor = withDeleteStartReset({ types: [ELEMENT_BLOCKQUOTE] })(
    input as Editor
  );

  editor.deleteBackward('character');

  expect(editor.children).toEqual(output.children);
});
