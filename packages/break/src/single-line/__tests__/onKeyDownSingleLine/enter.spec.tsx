/** @jsx jsx */

import { onKeyDownSingleLine } from '@/packages/break/src/single-line/onKeyDownSingleLine';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const event = new KeyboardEvent('keydown', { key: 'Enter' }) as any;

const output = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  onKeyDownSingleLine()(event);
  expect(input.children).toEqual(output.children);
});
