/** @jsx jsxt */

import { createEditor, createSlateEditor } from '@udecode/plate';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { jsxt } from '@udecode/plate-test-utils';

import { NormalizeTypesPlugin } from '../../../lib/NormalizeTypesPlugin';

jsxt;

const input = createEditor(
  (
    <editor>
      <hh1>test</hh1>
    </editor>
  ) as any
);

const output = (
  <editor>
    <hh1>test</hh1>
    <hh2>
      <htext />
    </hh2>
  </editor>
) as any;

it('should be', () => {
  const editor = createSlateEditor({
    plugins: [
      NormalizeTypesPlugin.configure({
        options: {
          rules: [{ path: [1], type: HEADING_KEYS.h2 }],
        },
      }),
    ],
    selection: input.selection,
    value: input.children,
  });

  editor.tf.normalizeNode([input, []]);

  expect(editor.children).toEqual(output.children);
});
