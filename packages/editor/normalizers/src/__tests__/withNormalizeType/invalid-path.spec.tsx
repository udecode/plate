/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { createNormalizeTypesPlugin } from '@/packages/editor/normalizers/src/createNormalizeTypesPlugin';
import { ELEMENT_H1 } from '@/packages/nodes/heading/src/constants';
import { ELEMENT_PARAGRAPH } from '@/packages/nodes/paragraph/src/createParagraphPlugin';

jsx;

const input = (<editor />) as any;

const output = (<editor />) as any;

it('should be', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [
      createNormalizeTypesPlugin({
        options: {
          rules: [
            {
              path: [0, 0],
              strictType: ELEMENT_H1,
            },
            { path: [0, 1], type: ELEMENT_PARAGRAPH },
          ],
        },
      }),
    ],
  });

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
