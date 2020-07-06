/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../__test-utils__/jsx';
import { withToggleType } from '../../../common/plugins/withToggleType';
import { BLOCKQUOTE } from '../../../elements/blockquote/types';

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

  editor.toggleType(BLOCKQUOTE);

  expect(editor.children).toEqual(output.children);
});
