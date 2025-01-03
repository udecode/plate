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
        test
        <cursor /> test2
      </hp>
    </editor>
  ) as any
);

const at = Range.start(input.selection as Range);

const output = {
  match: null,
  range: undefined,
};

it('should be', () => {
  expect(isWordAfterTrigger(input, { at, trigger: '@' })).toEqual(output);
});