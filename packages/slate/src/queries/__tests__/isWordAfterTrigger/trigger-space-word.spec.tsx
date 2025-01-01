/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';
import { Range } from 'slate';

import { createTEditor } from '../../../createTEditor';
import { isWordAfterTrigger } from '../../isWordAfterTrigger';

jsxt;

const input = createTEditor(
  (
    <editor>
      <hp>
        @ test
        <cursor /> test2
      </hp>
    </editor>
  ) as any
);

const at = Range.start(input.selection as Range);

it('should be', () => {
  expect(isWordAfterTrigger(input, { at, trigger: '@' }).match).toBeNull();
});
