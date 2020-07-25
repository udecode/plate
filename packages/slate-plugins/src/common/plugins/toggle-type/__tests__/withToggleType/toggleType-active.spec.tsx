/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../../__test-utils__/jsx';
import { ELEMENT_BLOCKQUOTE } from '../../../../../elements/blockquote/defaults';
import { withToggleType } from '../../withToggleType';

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

  editor.toggleType(ELEMENT_BLOCKQUOTE);

  expect(editor.children).toEqual(output.children);
});
