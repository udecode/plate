/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../createTEditor';
import { getRangeFromBlockStart } from '../../getRangeFromBlockStart';

jsxt;

const input = createTEditor(
  (
    <editor>
      te
      <cursor />
      st
    </editor>
  ) as any
);

it('should be', () => {
  expect(getRangeFromBlockStart(input)).toEqual(undefined);
});
