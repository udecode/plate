/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { createLinkPlugin } from '../../../../../../nodes/link/src/createLinkPlugin';
import { Value } from '../../../../slate/editor/TEditor';
import { PlateEditor } from '../../../../types/PlateEditor';
import { createPlateEditor } from '../../../../utils/createPlateEditor';
import { isBlockTextEmptyAfterSelection } from '../../../queries/isBlockTextEmptyAfterSelection';

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
