/** @jsx jsx */

import { MARK_BOLD, MARK_ITALIC } from '@udecode/plate-basic-marks';
import { jsx } from '@udecode/plate-test-utils';
import { toggleMark } from '@udecode/slate-utils';

jsx;

const input = (
  <editor>
    <hp>
      <htext bold>test</htext>
    </hp>
    <selection>
      <anchor offset={0} path={[0, 0]} />
      <focus offset={4} path={[0, 0]} />
    </selection>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      <htext italic>test</htext>
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  toggleMark(input, { clear: MARK_BOLD, key: MARK_ITALIC });
  expect(input.children).toEqual(output.children);
});
