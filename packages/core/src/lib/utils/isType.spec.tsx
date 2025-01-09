/** @jsx jsxt */
import { jsxt } from '@udecode/plate-test-utils';
import { createEditor } from '@udecode/slate';

import { createSlateEditor } from '../editor';
import { isType } from './isType';

jsxt;

const editor = createEditor(
  (
    <editor>
      <hp>test</hp>
    </editor>
  ) as any
);

it('should return true when type matches', () => {
  expect(
    isType(createSlateEditor({ editor }), editor.children[0], 'p')
  ).toEqual(true);
});
