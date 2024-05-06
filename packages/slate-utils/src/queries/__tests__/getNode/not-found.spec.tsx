/** @jsx jsx */

import type { PlateEditor } from '@udecode/plate-core';

import { jsx } from '@udecode/plate-test-utils';
import { getNode } from '@udecode/slate';

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
