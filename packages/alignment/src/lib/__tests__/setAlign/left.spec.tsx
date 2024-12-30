/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { createSlateEditor } from '@udecode/plate-common';
import { jsxt } from '@udecode/plate-test-utils';

import { BaseAlignPlugin } from '../../BaseAlignPlugin';
import { setAlign } from '../../transforms';

jsxt;

const input = (
  <editor>
    <hp align="center">
      test
      <cursor />
    </hp>
  </editor>
) as any as SlateEditor;

const output = (
  <editor>
    <hp>test</hp>
  </editor>
) as any as SlateEditor;

it('should remove align prop', () => {
  const editor = createSlateEditor({
    plugins: [BaseAlignPlugin],
    selection: input.selection,
    value: input.children,
  });

  setAlign(editor, { value: 'start' });

  expect(editor.children).toEqual(output.children);
});
