/** @jsx jsx */

import type { SlateEditor } from '@udecode/plate-core';

import { jsx } from '@udecode/plate-test-utils';

import { getRangeBefore } from '../../getRangeBefore';

jsx;

const input = (
  <editor>
    <hp>
      <cursor />
      test
    </hp>
  </editor>
) as any as SlateEditor;

const output = undefined;

it('should be', () => {
  expect(getRangeBefore(input, input.selection as any)).toEqual(output);
});
