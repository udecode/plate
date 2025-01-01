/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../../createTEditor';
import { getPointBeforeLocation } from '../../../getPointBeforeLocation';

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

const output = { offset: 4, path: [0, 0] };

it('should be', () => {
  expect(
    getPointBeforeLocation(input, input.selection as any, {
      afterMatch: true,
      matchString: 'test',
      skipInvalid: true,
      unit: 'word',
    })
  ).toEqual(output);
});
