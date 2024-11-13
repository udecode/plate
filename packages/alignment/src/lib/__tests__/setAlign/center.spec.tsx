/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-common';

import { createSlateEditor } from '@udecode/plate-common';
import { jsxt } from '@udecode/plate-test-utils';

import { BaseAlignPlugin } from '../../BaseAlignPlugin';
import { setAlign } from '../../transforms';

jsxt;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any as SlateEditor;

const output = (
  <editor>
    <hp align="center">test</hp>
  </editor>
) as any as SlateEditor;

it('should align center', () => {
  const editor = createSlateEditor({
    editor: input,
    plugins: [BaseAlignPlugin],
  });

  setAlign(editor, { value: 'center' });

  expect(editor.children).toEqual(output.children);
});
