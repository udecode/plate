/** @jsx jsx */

import {
  createPlateEditor,
  getEditorPlugin,
} from '@udecode/plate-common/react';
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
  const editor = createPlateEditor({ editor: input });

  onKeyDownSoftBreak({
    ...getEditorPlugin(editor, SoftBreakPlugin),
    event,
  });
  expect(editor.children).toEqual(output.children);
});
