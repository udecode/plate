/** @jsx jsx */

import { jsx } from '../../../../__test-utils__/jsx';
import { isBlockTextEmpty } from '../../../queries/index';

const input = (
  <hp>
    test
    <cursor />
  </hp>
) as any;

const output = false;

it('should be', () => {
  expect(isBlockTextEmpty(input)).toEqual(output);
});
