/** @jsx jsx */

import {
  createPlateEditor,
  getEditorPlugin,
} from '@udecode/plate-common/react';
import { jsx } from '@udecode/plate-test-utils';

import { ExitBreakPlugin } from '../../ExitBreakPlugin';
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
  input.blockFactory = (node: any) => node;
  onKeyDownExitBreak({
    ...getEditorPlugin(createPlateEditor({ editor: input }), ExitBreakPlugin),
    event,
  });
  expect(input.children).toEqual(output.children);
});
