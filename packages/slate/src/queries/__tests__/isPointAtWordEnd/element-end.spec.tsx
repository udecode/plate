/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';
import { Range } from 'slate';

import { createTEditor } from '../../../createTEditor';
import { isPointAtWordEnd } from '../../isPointAtWordEnd';

jsxt;

const input = createTEditor(
  (
    <editor>
      <hp>
        test
        <cursor />
      </hp>
    </editor>
  ) as any
);

const at = Range.start(input.selection as Range);

const output = true;

it('should be', () => {
  expect(isPointAtWordEnd(input, { at })).toEqual(output);
});
