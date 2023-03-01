/** @jsx jsx */

import { createLinkPlugin } from '@udecode/plate-link';
import { jsx } from '@udecode/plate-test-utils';
import { isBlockTextEmptyAfterSelection } from '../../../../../slate-utils/src/queries/isBlockTextEmptyAfterSelection';
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
    </hp>
  </editor>
) as any) as PlateEditor;

const output = true;

it('should be', () => {
  const editor = createPlateEditor({
    editor: input,
    plugins: [createLinkPlugin()],
  });

  expect(isBlockTextEmptyAfterSelection(editor)).toEqual(output);
});
