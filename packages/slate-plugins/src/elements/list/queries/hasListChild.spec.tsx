/** @jsx jsx */

import { jsx } from '../../../__test-utils__/jsx';
import { findNode } from '../../../common/queries/findNode';
import { hasListChild } from './hasListChild';

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
    const listItem = findNode(input, { match: { id: '2' } });

    expect(hasListChild(listItem?.[0] as any)).toBeTruthy();
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
    const listItem = findNode(input, { match: { id: '2' } });

    expect(hasListChild(listItem?.[0] as any)).toBeFalsy();
  });
});
