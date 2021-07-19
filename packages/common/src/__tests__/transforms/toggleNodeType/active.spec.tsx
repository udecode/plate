/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { Editor } from 'slate';
import { ELEMENT_BLOCKQUOTE } from '../../../../../elements/block-quote/src/defaults';
import { toggleNodeType } from '../../../transforms/toggleNodeType';

jsx;

const input = ((
  <editor>
    <hblockquote>
      test
      <cursor />
    </hblockquote>
  </editor>
) as any) as Editor;

const output = (
  <editor>
    <hdefault>
      test
      <cursor />
    </hdefault>
  </editor>
) as any;

it('should be', () => {
  toggleNodeType(input, { activeType: ELEMENT_BLOCKQUOTE });

  expect(input.children).toEqual(output.children);
});
