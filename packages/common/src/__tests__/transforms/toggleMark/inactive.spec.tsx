/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { MARK_BOLD } from '../../../../../marks/basic-marks/src/bold/defaults';
import { toggleMark } from '../../../transforms/toggleMark';

jsx;

const input = (
  <editor>
    <hp>test</hp>
    <selection>
      <anchor path={[0, 0]} offset={3} />
      <focus path={[0, 0]} offset={4} />
    </selection>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      tes
      <htext bold>t</htext>
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  toggleMark(input, { key: MARK_BOLD });
  expect(input.children).toEqual(output.children);
});
