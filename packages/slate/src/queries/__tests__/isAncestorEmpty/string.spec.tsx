/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../createTEditor';
import { isAncestorEmpty } from '../../isAncestorEmpty';

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

const output = false;

it('should be', () => {
  expect(isAncestorEmpty(input, input)).toEqual(output);
});
