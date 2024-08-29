/** @jsx jsx */

import type { SlateEditor } from '@udecode/plate-core';

import { jsx } from '@udecode/plate-test-utils';

import { getRangeBefore } from '../../getRangeBefore';

jsx;

const input = (
  <editor>
    <hp>
      test
      <cursor />
    </hp>
  </editor>
) as any as SlateEditor;

const output = {
  anchor: {
    offset: 3,
    path: [0, 0],
  },
  focus: {
    offset: 4,
    path: [0, 0],
  },
};

it('should be', () => {
  expect(getRangeBefore(input, input.selection as any)).toEqual(output);
});
