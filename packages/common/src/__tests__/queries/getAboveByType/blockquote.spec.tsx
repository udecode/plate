/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { Editor } from 'slate';
import { ELEMENT_BLOCKQUOTE } from '../../../constants';
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
