/** @jsx jsx */

import { TEditor } from '@udecode/slate-plugins-core';
import { jsx } from '@udecode/slate-plugins-test-utils';
import { mergeDeepToNodes } from '../../../transforms/index';

jsx;

const editor = ((
  <editor>
    <hp>test</hp>
  </editor>
) as any) as TEditor;

const props = { a: 1 };

const output = (
  <editor a={1}>
    <hp a={1}>
      <htext a={1}>test</htext>
    </hp>
  </editor>
) as any;

it('should do nothing', () => {
  mergeDeepToNodes({ node: editor, source: props });
  expect(editor.a).toBe(1);
  expect(editor.children).toEqual(output.children);
});
