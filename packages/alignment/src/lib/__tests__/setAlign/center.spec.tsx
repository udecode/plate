/** @jsx jsxt */

import { createEditor, createSlateEditor } from '@udecode/plate';
import { jsxt } from '@udecode/plate-test-utils';

import { BaseAlignPlugin } from '../../BaseAlignPlugin';
import { setAlign } from '../../transforms';

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

const output = (
  <editor>
    <hp align="center">test</hp>
  </editor>
) as any;

it('should align center', () => {
  const editor = createSlateEditor({
    plugins: [BaseAlignPlugin],
    selection: input.selection,
    value: input.children,
  });

  setAlign(editor, { value: 'center' });

  expect(editor.children).toEqual(output.children);
});
