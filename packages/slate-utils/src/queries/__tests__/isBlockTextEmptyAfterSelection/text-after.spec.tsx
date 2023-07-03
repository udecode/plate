/** @jsx jsx */

import { isBlockTextEmptyAfterSelection } from '@/packages/slate-utils/src/queries/isBlockTextEmptyAfterSelection';
import { PlateEditor } from '@udecode/plate-core/src/types/PlateEditor';
import { createPlateEditor } from '@udecode/plate-core/src/utils/createPlateEditor';
import { createLinkPlugin } from '@udecode/plate-link';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const input = (
  <editor>
    <hp>
      <htext>first</htext>
      <ha>
        test
        <cursor />
      </ha>
      last
    </hp>
  </editor>
) as any as PlateEditor;

const output = false;

it('should be', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [createLinkPlugin()],
  });

  expect(isBlockTextEmptyAfterSelection(editor)).toEqual(output);
});
