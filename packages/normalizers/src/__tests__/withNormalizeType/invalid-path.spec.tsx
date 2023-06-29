/** @jsx jsx */

import { ELEMENT_H1 } from '@/packages/heading/src/constants';
import { createNormalizeTypesPlugin } from '@/packages/normalizers/src/createNormalizeTypesPlugin';
import { ELEMENT_PARAGRAPH } from '@/packages/paragraph/src/createParagraphPlugin';
import { createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

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
