/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../__test-utils__/jsx';
import { withToggleType } from '../../../element';
import { BLOCKQUOTE } from '../../../elements';

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
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  const editor = withToggleType()(input as Editor);

  editor.toggleType(BLOCKQUOTE);

  expect(editor.children).toEqual(output.children);
});
