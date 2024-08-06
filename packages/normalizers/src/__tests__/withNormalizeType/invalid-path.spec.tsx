/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-common';
import { ELEMENT_H1 } from '@udecode/plate-heading';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';
import { jsx } from '@udecode/plate-test-utils';

import { NormalizeTypesPlugin } from '../../NormalizeTypesPlugin';

jsx;

const input = (<editor />) as any;

const output = (<editor />) as any;

it('should be', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [
      NormalizeTypesPlugin.configure({
        rules: [
          {
            path: [0, 0],
            strictType: ELEMENT_H1,
          },
          { path: [0, 1], type: ELEMENT_PARAGRAPH },
        ],
      }),
    ],
  });

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
