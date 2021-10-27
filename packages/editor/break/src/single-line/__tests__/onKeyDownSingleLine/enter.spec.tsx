/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { getSingleLineKeyDown } from '../../getSingleLineKeyDown';

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
  getSingleLineKeyDown()(input)(event);
  expect(input.children).toEqual(output.children);
});
