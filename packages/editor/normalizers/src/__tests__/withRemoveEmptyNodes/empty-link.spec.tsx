/** @jsx jsx */

import { createPlateEditor, PlateEditor } from '@udecode/plate-common';
import { jsx } from '@udecode/plate-test-utils';

import { createRemoveEmptyNodesPlugin } from '@/packages/editor/normalizers/src/createRemoveEmptyNodesPlugin';
import { ELEMENT_LINK } from '@/packages/nodes/link/src/createLinkPlugin';

jsx;

const input = (
  <editor>
    <hp>
      <ha url="http://google.com">
        <htext />
      </ha>
      <cursor />
    </hp>
  </editor>
) as any as PlateEditor;

const output = (
  <editor>
    <hp>
      <htext />
    </hp>
  </editor>
) as any;

it('should be', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [
      createRemoveEmptyNodesPlugin({
        options: {
          types: ELEMENT_LINK,
        },
      }),
    ],
  });

  editor.normalizeNode([(input.children[0] as any).children[0], [0, 0]]);

  expect(input.children).toEqual(output.children);
});
