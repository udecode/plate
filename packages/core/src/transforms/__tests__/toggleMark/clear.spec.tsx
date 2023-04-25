/** @jsx jsx */

import { MARK_BOLD, MARK_ITALIC } from '@udecode/plate-basic-marks';
import { jsx } from '@udecode/plate-test-utils';
import { toggleMark } from '../../../../../slate-utils/src/transforms/toggleMark';

jsx;

const input = (
  <editor>
    <hp>
      <htext bold>test</htext>
    </hp>
    <selection>
      <anchor path={[0, 0]} offset={0} />
      <focus path={[0, 0]} offset={4} />
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
  toggleMark(input, { key: MARK_ITALIC, clear: MARK_BOLD });
  expect(input.children).toEqual(output.children);
});
