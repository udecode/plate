/** @jsx jsx */

import { BlockquotePlugin } from '@udecode/plate-block-quote';
import { jsx } from '@udecode/plate-test-utils';

import type { PlateEditor } from '../../../editor';

import { toggleNodeType } from '../../toggleNodeType';

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
  toggleNodeType(input, { activeType: BlockquotePlugin.key });

  expect(input.children).toEqual(output.children);
});
