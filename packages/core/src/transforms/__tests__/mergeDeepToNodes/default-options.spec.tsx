/** @jsx jsx */

import { jsx } from '@udecode/plate-test-utils';
import { TNode } from '../../../../../slate-utils/src/slate/node/TNode';
import { mergeDeepToNodes } from '../../../../../slate-utils/src/utils/mergeDeepToNodes';
import { PlateEditor } from '../../../types/plate/PlateEditor';

jsx;

const editor = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as PlateEditor;

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
