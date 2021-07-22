/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { MARK_BOLD } from '../../../../../marks/basic-marks/src/bold/defaults';
import { isMarkActive } from '../../../queries/isMarkActive';

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
