/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../createTEditor';
import { isBlockTextEmptyAfterSelection } from '../../isBlockTextEmptyAfterSelection';

jsxt;

const input = createTEditor(
  (
    <editor>
      <hp>
        <htext>first</htext>
        <ha>
          tes
          <cursor />t
        </ha>
        <htext />
      </hp>
    </editor>
  ) as any
);

const output = false;

it('should be', () => {
  expect(isBlockTextEmptyAfterSelection(input)).toEqual(output);
});
