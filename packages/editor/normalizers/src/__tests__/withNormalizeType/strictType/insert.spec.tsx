/** @jsx jsx */

import { createPlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';
import { ELEMENT_H2 } from '../../../../../../nodes/heading/src/constants';
import { createNormalizeTypesPlugin } from '../../../createNormalizeTypesPlugin';

jsx;

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
  const editor = createPlateEditor({
    editor: input,
    plugins: [
      createNormalizeTypesPlugin({
        options: {
          rules: [{ path: [1], strictType: ELEMENT_H2 }],
        },
      }),
    ],
  });

  editor.normalizeNode([input, []]);

  expect(input.children).toEqual(output.children);
});
