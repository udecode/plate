/** @jsx jsx */

import { isMarkActive } from '@/packages/slate-utils/src/queries/isMarkActive';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const input = (
  <editor>
    <hp>
      tes
      <htext bold>t</htext>
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  expect(isMarkActive(input, 'bold')).toEqual(true);
});
