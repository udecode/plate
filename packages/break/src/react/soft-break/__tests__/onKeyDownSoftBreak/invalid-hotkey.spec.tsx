/** @jsx jsx */

import { getPluginContext } from '@udecode/plate-common/react';
import { jsx } from '@udecode/plate-test-utils';

import { SoftBreakPlugin } from '../../SoftBreakPlugin';
import { onKeyDownSoftBreak } from '../../onKeyDownSoftBreak';

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
  onKeyDownSoftBreak({
    ...getPluginContext(input, SoftBreakPlugin),
    event,
  });
  expect(input.children).toEqual(output.children);
});
