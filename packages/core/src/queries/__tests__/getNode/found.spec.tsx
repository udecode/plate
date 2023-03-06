/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { getNode } from '../../../../../slate/src/interfaces/node/getNode';
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
  expect(getNode(input, [0])).toBeDefined();
});
