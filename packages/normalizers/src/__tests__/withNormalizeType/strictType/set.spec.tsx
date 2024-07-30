/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-common';
import { ELEMENT_H1 } from '@udecode/plate-heading';
import { jsx } from '@udecode/plate-test-utils';

import { createNormalizeTypesPlugin } from '../../../NormalizeTypesPlugin';

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
    <hh1>test</hh1>
    <hh2>test</hh2>
    <hh2>test</hh2>
  </editor>
) as any;

it('should be', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [
      createNormalizeTypesPlugin({
        options: {
          rules: [{ path: [0], strictType: ELEMENT_H1 }],
        },
      }),
    ],
  });

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
