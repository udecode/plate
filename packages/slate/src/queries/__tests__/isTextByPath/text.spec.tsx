/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';

import { createTEditor } from '../../../createTEditor';
import { isTextByPath } from '../../isTextByPath';

jsxt;

const editor = createTEditor(
  (
    <editor>
      <hp>test</hp>
    </editor>
  ) as any
);

const path = [0, 0];

const output = true;

it('should be', () => {
  expect(isTextByPath(editor, path)).toEqual(output);
});
