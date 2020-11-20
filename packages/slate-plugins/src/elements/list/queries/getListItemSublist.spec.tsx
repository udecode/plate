/** @jsx jsx */

import { jsx } from '../../../__test-utils__/jsx';
import { getListItemSublist } from './getListItemSublist';

describe('when there is a sublist', () => {
  const input = (
    <hli>
      <hp>
        1
        <cursor />
      </hp>
      <hul>
        <hli>
          <hp>11</hp>
        </hli>
      </hul>
    </hli>
  ) as any;

  const output = (
    <hul>
      <hli>
        <hp>11</hp>
      </hli>
    </hul>
  ) as any;

  it('should be', () => {
    const sublist = getListItemSublist([input, [0]]);

    expect(sublist).toEqual([output, [0, 1]]);
  });
});

describe('when there is no sublist', () => {
  const input = (
    <hli>
      <hp>
        1
        <cursor />
      </hp>
    </hli>
  ) as any;

  it('should be', () => {
    const sublist = getListItemSublist([input, [0]]);

    expect(sublist).toBeUndefined();
  });
});
