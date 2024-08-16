/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-common/react';
import { HEADING_KEYS } from '@udecode/plate-heading';
import { jsx } from '@udecode/plate-test-utils';

import { NormalizeTypesPlugin } from '../../../NormalizeTypesPlugin';

jsx;

const input = (
  <editor>
    <hh2>test</hh2>
    <hh2>test</hh2>
    <hh2>test</hh2>
  </editor>
) as any;

const output = (
  <editor>
    <hh2>test</hh2>
    <hh2>test</hh2>
    <hh2>test</hh2>
  </editor>
) as any;

it('should be', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [
      NormalizeTypesPlugin.configure({
        options: {
          rules: [{ path: [0], type: HEADING_KEYS.h1 }],
        },
      }),
    ],
  });

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
