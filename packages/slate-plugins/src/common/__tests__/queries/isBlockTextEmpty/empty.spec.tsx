/** @jsx jsx */

import { jsx } from '../../../../__test-utils__/jsx';
import { isBlockTextEmpty } from '../../../queries/index';

const input = (
  <hp>
    <cursor />
  </hp>
) as any;

const output = true;

it('should be', () => {
  expect(isBlockTextEmpty(input)).toEqual(output);
});
