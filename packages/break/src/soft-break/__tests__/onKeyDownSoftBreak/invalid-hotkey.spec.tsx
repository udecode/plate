/** @jsx jsx */

import { jsx } from '@udecode/slate-plugins-test-utils';
import { getSoftBreakOnKeyDown } from '../../getSoftBreakOnKeyDown';

jsx;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

const event = new KeyboardEvent('keydown') as any;

const output = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any;

it('should be', () => {
  getSoftBreakOnKeyDown()(input)(event);
  expect(input.children).toEqual(output.children);
});
