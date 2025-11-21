/** @jsx jsxt */
import { expect, test as it } from 'bun:test';
import { createEditor } from '@platejs/slate';
import { jsxt } from '@platejs/test-utils';

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
