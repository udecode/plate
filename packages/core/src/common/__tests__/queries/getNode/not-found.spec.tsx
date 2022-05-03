/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { PlateEditor } from '../../../../types/PlateEditor';
import { getNodeNode } from '../../../queries/index';

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
