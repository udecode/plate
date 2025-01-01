/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../createTEditor';
import { getSelectionText } from '../../getSelectionText';

jsxt;

const input = createTEditor(
  (
    <editor>
      <hp>
        <anchor />
        test
        <focus />
      </hp>
    </editor>
  ) as any
);

const output = 'test';

it('should be', () => {
  expect(getSelectionText(input)).toBe(output);
});
