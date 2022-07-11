/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { createLinkPlugin } from 'packages/nodes/link/src/createLinkPlugin';
import { Range } from 'slate';
import { TDescendant } from '../../../slate/node/TDescendant';
import { PlateEditor } from '../../../types/plate/PlateEditor';
import { createPlateEditor } from '../../../utils/plate/createPlateEditor';
import { getBlockAbove } from '../../getBlockAbove';
import { getNextSiblingNodes } from '../../getNextSiblingNodes';

jsx;

const input = ((
  <editor>
    <hp>
      <htext>first</htext>
      <ha>
        test
        <cursor />
      </ha>
    </hp>
  </editor>
) as any) as PlateEditor;

const output: TDescendant[] = [];

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
