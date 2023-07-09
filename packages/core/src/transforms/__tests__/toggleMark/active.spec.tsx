/** @jsx jsx */

import { MARK_BOLD } from '@udecode/plate-basic-marks';
import { jsx } from '@udecode/plate-test-utils';
import { toggleMark } from '@udecode/slate-utils/src/transforms/toggleMark';

jsx;

const input = (
  <editor>
    <hp>
      tes
      <htext bold>t</htext>
    </hp>
    <selection>
      <anchor path={[0, 1]} offset={0} />
      <focus path={[0, 1]} offset={1} />
    </selection>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  toggleMark(input, { key: MARK_BOLD });
  expect(input.children).toEqual(output.children);
});
