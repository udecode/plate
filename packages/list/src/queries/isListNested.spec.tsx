/** @jsx jsx */

import { findNode } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { isListNested } from './isListNested';

jsx;

describe('when the list is nested', () => {
  const input = (
    <editor>
      <hul id="1">
        <hli id="2">
          <hp>2</hp>
          <hul id="21">
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
    const list = findNode(input, { match: { id: '21' } });

    expect(isListNested(input, list?.[1] as any)).toBeTruthy();
  });
});

describe('when the list is not nested', () => {
  const input = (
    <editor>
      <hul id="1">
        <hli id="2">
          <hp>2</hp>
        </hli>
      </hul>
    </editor>
  ) as any;

  it('should be', () => {
    const list = findNode(input, { match: { id: '1' } });

    expect(isListNested(input, list?.[1] as any)).toBeFalsy();
  });
});
