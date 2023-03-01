/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { getNode } from '../../../../../slate-utils/src/slate/node/getNode';
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

it('should be', () => {
  expect(getNode(input, [0, 0, 0])).toBeNull();
});
