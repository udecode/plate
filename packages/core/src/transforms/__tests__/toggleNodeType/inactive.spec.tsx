/** @jsx jsx */

import { toggleNodeType } from '@/packages/core/src/transforms/toggleNodeType';
import { PlateEditor } from '@/packages/core/src/types/PlateEditor';
import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote/src/createBlockquotePlugin';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any as PlateEditor;

const output = (
  <editor>
    <hblockquote>
      test
      <cursor />
    </hblockquote>
  </editor>
) as any;

it('should be', () => {
  toggleNodeType(input, { activeType: ELEMENT_BLOCKQUOTE });

  expect(input.children).toEqual(output.children);
});
