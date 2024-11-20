/** @jsx jsxt */

import { createSlateEditor } from '@udecode/plate-common';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { jsxt } from '@udecode/plate-test-utils';

import { NormalizeTypesPlugin } from '../../../lib/NormalizeTypesPlugin';

jsxt;

const input = (
  <editor>
    <hh1>test</hh1>
  </editor>
) as any;

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
    editor: input,
    plugins: [
      NormalizeTypesPlugin.configure({
        options: {
          rules: [{ path: [1], type: HEADING_KEYS.h2 }],
        },
      }),
    ],
  });

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
