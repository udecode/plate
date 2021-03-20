/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { onKeyDownExitBreak } from '../../onKeyDownExitBreak';

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const event = new KeyboardEvent('keydown');

const output = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  onKeyDownExitBreak()(input)(event);
  expect(input.children).toEqual(output.children);
});
