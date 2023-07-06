/** @jsx jsx */

import { PlateEditor } from '@udecode/plate-core/src/types/PlateEditor';
import { jsx } from '@udecode/plate-test-utils';
import { getNode } from '@udecode/slate/src/interfaces/node/getNode';

jsx;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any as PlateEditor;

it('should be', () => {
  expect(getNode(input, [0, 0, 0])).toBeNull();
});
