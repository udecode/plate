/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../../createTEditor';
import { getPointBeforeLocation } from '../../../getPointBeforeLocation';

jsxt;

const input = createTEditor(
  (
    <editor>
      <hp>
        test http://google.com
        <cursor />
      </hp>
    </editor>
  ) as any
);

const output = undefined;

it('should be', () => {
  expect(
    getPointBeforeLocation(input, input.selection as any, {
      matchString: '3',
      skipInvalid: false,
    })
  ).toEqual(output);
});
