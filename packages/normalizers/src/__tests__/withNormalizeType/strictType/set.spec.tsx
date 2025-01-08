/** @jsx jsxt */

import { createEditor, createSlateEditor } from '@udecode/plate';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { jsxt } from '@udecode/plate-test-utils';

import { NormalizeTypesPlugin } from '../../../lib/NormalizeTypesPlugin';

jsxt;

const input = createEditor(
  (
    <editor>
      <hh2>test</hh2>
      <hh2>test</hh2>
      <hh2>test</hh2>
    </editor>
  ) as any
);

const output = (
  <editor>
    <hh1>test</hh1>
    <hh2>test</hh2>
    <hh2>test</hh2>
  </editor>
) as any;

it('should be', () => {
  const editor = createSlateEditor({
    plugins: [
      NormalizeTypesPlugin.configure({
        options: {
          rules: [{ path: [0], strictType: HEADING_KEYS.h1 }],
        },
      }),
    ],
    selection: input.selection,
    value: input.children,
  });

  editor.tf.normalizeNode([input, []]);

  expect(editor.children).toEqual(output.children);
});
