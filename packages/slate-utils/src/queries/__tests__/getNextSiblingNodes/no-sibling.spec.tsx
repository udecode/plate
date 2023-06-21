/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { TDescendant } from '@udecode/slate';
import { Range } from 'slate';

import { PlateEditor } from '@/packages/core/src/types/PlateEditor';
import { createPlateEditor } from '@/packages/core/src/utils/createPlateEditor';
import { createLinkPlugin } from '@/packages/nodes/link/src/index';
import { getBlockAbove } from '@/packages/slate-utils/src/queries/getBlockAbove';
import { getNextSiblingNodes } from '@/packages/slate-utils/src/queries/getNextSiblingNodes';

jsx;

const input = (
  <editor>
    <hp>
      <htext>first</htext>
      <ha>
        test
        <cursor />
      </ha>
    </hp>
  </editor>
) as any as PlateEditor;

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
