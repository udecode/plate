/** @jsx jsxt */

import { createEditor, createSlateEditor } from '@udecode/plate';
import { ParagraphPlugin } from '@udecode/plate/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { jsxt } from '@udecode/plate-test-utils';

import { NormalizeTypesPlugin } from '../../lib/NormalizeTypesPlugin';

jsxt;

const input = createEditor(
  (
    <editor>
      <element />
    </editor>
  ) as any
);

const output = (
  <editor>
    <element>
      <hh1>
        <htext />
      </hh1>
      <hp>
        <htext />
      </hp>
    </element>
  </editor>
) as any;

it('should be', () => {
  const editor = createSlateEditor({
    plugins: [
      NormalizeTypesPlugin.configure({
        options: {
          rules: [
            {
              path: [0, 0],
              strictType: HEADING_KEYS.h1,
            },
            { path: [0, 1], type: ParagraphPlugin.key },
          ],
        },
      }),
    ],
    selection: input.selection,
    value: input.children,
  });

  editor.tf.normalizeNode([input, []]);

  expect(editor.children).toEqual(output.children);
});
