/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-core';

import { jsxt } from '@udecode/plate-test-utils';
import { isCollapsed } from '@udecode/slate';

jsxt;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any as SlateEditor;

const output = true;

it('should be', () => {
  expect(isCollapsed(input.selection)).toBe(output);
});
