/** @jsx jsx */

import { createLinkPlugin } from '@udecode/plate-link';
import { jsx } from '@udecode/plate-test-utils';
import { Range } from 'slate';
import { getBlockAbove } from '../../../../../slate-utils/src/queries/getBlockAbove';
import { getNextSiblingNodes } from '../../../../../slate-utils/src/queries/getNextSiblingNodes';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { createPlateEditor } from '../../../utils/plate/createPlateEditor';

jsx;

const input = ((
  <editor>
    <hp>
      <htext>first</htext>
      <ha>
        test
        <cursor />
      </ha>
      <htext />
      <htext>last</htext>
    </hp>
  </editor>
) as any) as PlateEditor;

const output = [<htext />, <htext>last</htext>];

it('should be', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [createLinkPlugin()],
  });

  const above = getBlockAbove(editor) as any;

  expect(
    getNextSiblingNodes(above, (input.selection as Range).anchor.path)
  ).toEqual(output);
});
