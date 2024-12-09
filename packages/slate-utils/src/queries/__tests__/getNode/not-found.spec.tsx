/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-core';

import { jsxt } from '@udecode/plate-test-utils';
import { getNode } from '@udecode/slate';

jsxt;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any as SlateEditor;

it('should be', () => {
  expect(getNode(input, [0, 0, 0])).toBeNull();
});
