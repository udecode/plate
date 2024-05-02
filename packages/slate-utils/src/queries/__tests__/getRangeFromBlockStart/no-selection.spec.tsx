/** @jsx jsx */

import type { PlateEditor } from '@udecode/plate-core';

import { jsx } from '@udecode/plate-test-utils';

import { getRangeFromBlockStart } from '../../getRangeFromBlockStart';

jsx;

const input = (
  <editor>
    <hp>test</hp>
  </editor>
) as any as PlateEditor;

const output = undefined;

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(output);
});
