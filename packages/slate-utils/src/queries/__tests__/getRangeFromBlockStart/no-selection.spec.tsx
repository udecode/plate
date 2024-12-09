/** @jsx jsxt */

import type { SlateEditor } from '@udecode/plate-core';

import { jsxt } from '@udecode/plate-test-utils';

import { getRangeFromBlockStart } from '../../getRangeFromBlockStart';

jsxt;

const input = (
  <editor>
    <hp>test</hp>
  </editor>
) as any as SlateEditor;

const output = undefined;

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(output);
});
