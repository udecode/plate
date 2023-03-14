/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { PlateEditor } from '../../../../../core/src/types/PlateEditor';
import { getSelectionText } from '../../getSelectionText';

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
