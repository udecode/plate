/** @jsx jsxt */

import {
  createPlateEditor,
  getEditorPlugin,
} from '@udecode/plate-common/react';
import { jsxt } from '@udecode/plate-test-utils';

import { SoftBreakPlugin } from '../../SoftBreakPlugin';
import { onKeyDownSoftBreak } from '../../onKeyDownSoftBreak';

jsxt;

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
  const editor = createPlateEditor({ editor: input });

  onKeyDownSoftBreak({
    ...getEditorPlugin(editor, SoftBreakPlugin),
    event,
  });
  expect(editor.children).toEqual(output.children);
});
