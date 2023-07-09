/** @jsx jsx */

import { getSelectionText } from '@/packages/slate-utils/src/queries/getSelectionText';
import { PlateEditor } from '@udecode/plate-core/src/types/PlateEditor';
import { jsx } from '@udecode/plate-test-utils';

jsx;

const input = (
  <editor>
    <hp>
      <anchor />
      test
      <focus />
    </hp>
  </editor>
) as any as PlateEditor;

const output = 'test';

it('should be', () => {
  expect(getSelectionText(input)).toBe(output);
});
