/** @jsx jsx */

import { jsx } from '../../../../__test-utils__/jsx';
import { isMarkActive } from '../../../../common/queries/isMarkActive';
import { MARK_BOLD } from '../../../../marks/bold/types';

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
