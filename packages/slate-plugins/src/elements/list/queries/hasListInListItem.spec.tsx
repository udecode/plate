/** @jsx jsx */

import { getNodeById } from '@udecode/slate-plugins-common';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { hasListInListItem } from './hasListInListItem';

describe('when there is a sublist', () => {
  const input = (
    <editor>
      <hul>
        <hli id="2">
          <hp>2</hp>
          <hul>
            <hli>
              <hp>21</hp>
            </hli>
            <hli>
              <hp>
                22
                <cursor />
              </hp>
            </hli>
          </hul>
        </hli>
      </hul>
    </editor>
  ) as any;

  it('should be', () => {
    const listItem = getNodeById(input, '2');

    expect(hasListInListItem(listItem[0] as any)).toBeTruthy();
  });
});

describe('when there is no sublist', () => {
  const input = (
    <editor>
      <hul>
        <hli id="2">
          <hp>2</hp>
        </hli>
      </hul>
    </editor>
  ) as any;

  it('should be', () => {
    const listItem = getNodeById(input, '2');

    expect(hasListInListItem(listItem[0] as any)).toBeFalsy();
  });
});
