/** @jsx jsxt */
import { createSlateEditor } from '@udecode/plate-core';
import { jsxt } from '@udecode/plate-test-utils';
import { createTEditor } from '@udecode/slate';

import { isType } from './isType';

jsxt;

const editor = createTEditor(
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
