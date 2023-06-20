/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';

import { isMarkActive } from '@/slate-utils/src/queries/isMarkActive';

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
