/** @jsx jsx */

import { jsx } from '__test-utils__/jsx';
import { isBlockTextEmpty } from 'common/queries';

const input = (
  <hp>
    <cursor />
  </hp>
) as any;

const output = true;

it('should be', () => {
  expect(isBlockTextEmpty(input)).toEqual(output);
});
