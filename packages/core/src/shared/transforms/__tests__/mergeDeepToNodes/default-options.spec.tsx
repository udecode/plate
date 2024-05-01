/** @jsx jsx */

import type { PlateEditor } from '@udecode/plate-common';
import type { TNode } from '@udecode/slate';

import { jsx } from '@udecode/plate-test-utils';

import { mergeDeepToNodes } from '../../utils/index';

jsx;

const editor = (
  <editor>
    <hp>test</hp>
  </editor>
) as any as PlateEditor;

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
