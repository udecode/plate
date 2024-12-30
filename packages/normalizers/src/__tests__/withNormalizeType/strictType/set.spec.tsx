/** @jsx jsxt */

import { createSlateEditor } from '@udecode/plate-common';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { jsxt } from '@udecode/plate-test-utils';

import { NormalizeTypesPlugin } from '../../../lib/NormalizeTypesPlugin';

jsxt;

const input = (
  <editor>
    <hh2>test</hh2>
    <hh2>test</hh2>
    <hh2>test</hh2>
  </editor>
) as any;

const output = (
  <editor>
    <hh1>test</hh1>
    <hh2>test</hh2>
    <hh2>test</hh2>
  </editor>
) as any;

it('should be', () => {
  const editor = createSlateEditor({
    value: input.children,
    selection: input.selection,
    plugins: [
      NormalizeTypesPlugin.configure({
        options: {
          rules: [{ path: [0], strictType: HEADING_KEYS.h1 }],
        },
      }),
    ],
  });

  editor.normalizeNode([input, []]);

  expect(editor.children).toEqual(output.children);
});
