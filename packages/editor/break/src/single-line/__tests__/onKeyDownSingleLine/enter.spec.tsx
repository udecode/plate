/** @jsx jsx */

import { mockPlugin } from '@udecode/plate-core';
import { jsx } from '@udecode/plate-test-utils';
import { onKeyDownSingleLine } from '../../onKeyDownSingleLine';

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
  onKeyDownSingleLine(input, mockPlugin())(event);
  expect(input.children).toEqual(output.children);
});
