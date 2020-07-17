/** @jsx jsx */

import { jsx } from '../../../../__test-utils__/jsx';
import { MARK_BOLD } from '../../../../marks/bold/index';
import { MARK_ITALIC } from '../../../../marks/italic/index';
import { toggleMark } from '../../../transforms/toggleMark';

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
  toggleMark(input, MARK_ITALIC, MARK_BOLD);
  expect(input.children).toEqual(output.children);
});
