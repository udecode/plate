/** @jsx jsx */

import type { SlateEditor } from '@udecode/plate-core';

import { jsx } from '@udecode/plate-test-utils';

import { getRangeFromBlockStart } from '../../getRangeFromBlockStart';

jsx;

const input = (
  <editor>
    <hp>test</hp>
  </editor>
) as any as SlateEditor;

const output = undefined;

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(output);
});
