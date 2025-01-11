/** @jsx jsxt */

import { jsxt } from '@udecode/plate-test-utils';
import { type TNode, createEditor } from '@udecode/slate';

import { mergeDeepToNodes } from '../../../utils';

jsxt;

const editor = createEditor(
  (
    <editor>
      <hp>test</hp>
    </editor>
  ) as any
);

const props = { a: 1 };

const output = (
  <editor a={1}>
    <hp a={1}>
      <htext a={1}>test</htext>
    </hp>
  </editor>
) as any;

it('should do nothing', () => {
  mergeDeepToNodes<TNode>({ node: editor as any, source: props });
  expect(editor.a).toBe(1);
  expect(editor.children).toEqual(output.children);
});
