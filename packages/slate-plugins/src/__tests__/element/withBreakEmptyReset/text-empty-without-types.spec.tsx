/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
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

const output = (
  <editor>
    <hblockquote>
      <htext />
    </hblockquote>
    <hblockquote>
      <htext />
      <cursor />
    </hblockquote>
  </editor>
) as any;

it('should be', () => {
  const editor = withBreakEmptyReset({ types: [] })(input as Editor);

  editor.insertBreak();

  expect(editor.children).toEqual(output.children);
});
