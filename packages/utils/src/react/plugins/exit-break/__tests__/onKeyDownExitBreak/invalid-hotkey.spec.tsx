/** @jsx jsxt */

import { createEditor } from '@udecode/plate';
import { createPlateEditor, getEditorPlugin } from '@udecode/plate/react';
import { jsxt } from '@udecode/plate-test-utils';

import { ExitBreakPlugin } from '../../ExitBreakPlugin';
import { onKeyDownExitBreak } from '../../onKeyDownExitBreak';

jsxt;

const input = createEditor(
  (
    <editor>
      <hp>
        test
        <cursor />
      </hp>
    </editor>
  ) as any
);

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
    ...getEditorPlugin(createPlateEditor({ editor: input }), ExitBreakPlugin),
    event,
  });
  expect(input.children).toEqual(output.children);
});
