/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { isMarkActive } from '../../isMarkActive';

jsxt;

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
