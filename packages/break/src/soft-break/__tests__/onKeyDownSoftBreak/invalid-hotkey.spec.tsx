/** @jsx jsx */

import { createPlugin } from '@udecode/plate-common';
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
  onKeyDownSoftBreak({ editor: input, event, plugin: createPlugin() });
  expect(input.children).toEqual(output.children);
});
