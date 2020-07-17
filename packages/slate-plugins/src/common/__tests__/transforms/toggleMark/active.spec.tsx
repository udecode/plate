/** @jsx jsx */

import { jsx } from '../../../../__test-utils__/jsx';
import { MARK_BOLD } from '../../../../marks/bold/index';
import { toggleMark } from '../../../transforms/toggleMark';

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
  toggleMark(input, MARK_BOLD);
  expect(input.children).toEqual(output.children);
});
