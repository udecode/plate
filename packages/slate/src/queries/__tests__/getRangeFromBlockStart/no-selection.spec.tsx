/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import type { TEditor } from '../../../interfaces';

import { getRangeFromBlockStart } from '../../getRangeFromBlockStart';

jsxt;

const input = (
  <editor>
    <hp>test</hp>
  </editor>
) as any as TEditor;

const output = undefined;

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(output);
});
