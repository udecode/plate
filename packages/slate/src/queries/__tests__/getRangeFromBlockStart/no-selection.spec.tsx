/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../createTEditor';
import { getRangeFromBlockStart } from '../../getRangeFromBlockStart';

jsxt;

const input = createTEditor(
  (
    <editor>
      <hp>test</hp>
    </editor>
  ) as any
);

const output = undefined;

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(output);
});
