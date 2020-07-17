/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { withToggleType } from '../../../../common/plugins/withToggleType';
import { ELEMENT_BLOCKQUOTE } from '../../../../elements/blockquote/defaults';

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hblockquote>
      test
      <cursor />
    </hblockquote>
  </editor>
) as any;

it('should be', () => {
  const editor = withToggleType()(input as Editor);

  editor.toggleType(ELEMENT_BLOCKQUOTE);

  expect(editor.children).toEqual(output.children);
});
