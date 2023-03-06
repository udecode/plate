/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { isCollapsed } from '../../../../../slate/src/interfaces/range/isCollapsed';
import { PlateEditor } from '../../../types/plate/PlateEditor';

jsx;

const input = ((
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any) as PlateEditor;

const output = true;

it('should be', () => {
  expect(isCollapsed(input.selection)).toBe(output);
});
