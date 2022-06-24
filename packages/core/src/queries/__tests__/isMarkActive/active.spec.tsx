/** @jsx jsx */

import { MARK_BOLD } from '@udecode/plate-basic-marks';
import { jsx } from '@udecode/plate-test-utils';
import { isMarkActive } from '../../isMarkActive';

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
  expect(isMarkActive(input, MARK_BOLD)).toEqual(true);
});
