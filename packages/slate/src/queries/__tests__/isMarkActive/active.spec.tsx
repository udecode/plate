/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../createTEditor';
import { isMarkActive } from '../../isMarkActive';

jsxt;

const input = createTEditor(
  (
    <editor>
      <hp>
        tes
        <htext bold>t</htext>
        <cursor />
      </hp>
    </editor>
  ) as any
);

it('should be', () => {
  expect(isMarkActive(input, 'bold')).toEqual(true);
});
