/** @jsx jsx */

import { createPlugin, getPluginContext } from '@udecode/plate-common';
import { createPlateEditor } from '@udecode/plate-common/react';
import { jsx } from '@udecode/plate-test-utils';

import { onKeyDownExitBreak } from '../../onKeyDownExitBreak';

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
  onKeyDownExitBreak({
    ...getPluginContext(createPlateEditor({ editor: input }), createPlugin({})),
    event,
  });
  expect(input.children).toEqual(output.children);
});
