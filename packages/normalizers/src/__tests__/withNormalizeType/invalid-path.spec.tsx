/** @jsx jsxt */

import { createSlateEditor } from '@udecode/plate-common';
import { ParagraphPlugin } from '@udecode/plate-common/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { jsxt } from '@udecode/plate-test-utils';

import { NormalizeTypesPlugin } from '../../lib/NormalizeTypesPlugin';

jsxt;

const input = (
  <editor>
    <hp>
      <htext />
    </hp>
  </editor>
) as any;

const output = (
  <editor>
    <hp>
      <htext />
    </hp>
  </editor>
) as any;

it('should be', () => {
  const editor = createSlateEditor({
    editor: input,
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
  });

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
