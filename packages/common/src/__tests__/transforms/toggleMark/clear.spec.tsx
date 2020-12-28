/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { MARK_BOLD } from '../../../../../slate-plugins/src/marks/bold/defaults';
import { MARK_ITALIC } from '../../../../../slate-plugins/src/marks/italic/defaults';
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
