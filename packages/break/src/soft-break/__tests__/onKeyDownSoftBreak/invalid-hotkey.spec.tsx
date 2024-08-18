/** @jsx jsx */

import { createSlatePlugin, getPluginContext } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

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
    ...getPluginContext(input, createSlatePlugin()),
    event,
  });
  expect(input.children).toEqual(output.children);
});
