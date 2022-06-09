/** @jsx jsx */

import { createLinkPlugin } from '@udecode/plate-link';
import { jsx } from '@udecode/plate-test-utils';
import { Range } from 'slate';
import { Value } from '../../../../slate/editor/TEditor';
import { PlateEditor } from '../../../../types/PlateEditor';
import { createPlateEditor } from '../../../../utils/createPlateEditor';
import { getBlockAbove } from '../../../queries/getBlockAbove';
import { getNextSiblingNodes } from '../../../queries/getNextSiblingNodes';

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
