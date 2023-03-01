/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { getSelectionText } from '../../../../../slate-utils/src/queries/getSelectionText';
import { PlateEditor } from '../../../types/plate/PlateEditor';

jsx;

const input = ((
  <editor>
    <hp>
      <anchor />
      test
      <focus />
    </hp>
  </editor>
) as any) as PlateEditor;

const output = 'test';

it('should be', () => {
  expect(getSelectionText(input)).toBe(output);
});
