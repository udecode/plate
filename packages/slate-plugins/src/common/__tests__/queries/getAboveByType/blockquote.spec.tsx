/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_BLOCKQUOTE } from '../../../../elements/blockquote/defaults';
import { getAboveByType } from '../../../queries/index';

const input = ((
  <editor>
    <hblockquote>
      test
      <cursor />
    </hblockquote>
  </editor>
) as any) as Editor;

it('should be', () => {
  expect(getAboveByType(input, [ELEMENT_BLOCKQUOTE])).toEqual([
    <hblockquote>test</hblockquote>,
    [0],
  ]);
});
