/** @jsx jsx */

import { createSlateEditor } from '@udecode/plate-common';
import { ParagraphPlugin } from '@udecode/plate-common/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { jsx } from '@udecode/plate-test-utils';

import { NormalizeTypesPlugin } from '../../lib/NormalizeTypesPlugin';

jsx;

const input = (
  <editor>
    <element />
  </editor>
) as any;

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
