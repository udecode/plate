/** @jsx jsx */

import { Editor } from 'slate';
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_BLOCKQUOTE } from '../../../../elements/blockquote/defaults';
import { toggleNodeType } from '../../../transforms/toggleNodeType';

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
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  toggleNodeType(input, { activeType: ELEMENT_BLOCKQUOTE });

  expect(input.children).toEqual(output.children);
});
