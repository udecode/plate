/** @jsx jsx */

import { Editor } from 'slate';
import { withReact } from 'slate-react';
import { jsx } from '../../../../__test-utils__/jsx';
import { ELEMENT_IMAGE } from '../../../../elements';
import { withSelectOnBackspace } from '../../../plugins/select-on-backspace';
import { pipe } from '../../../utils';

const input = ((
  <editor>
    <element type={ELEMENT_IMAGE} url="https://i.imgur.com/removed.png">
      <htext />
    </element>
    <cursor />
    <hp>test</hp>
  </editor>
) as any) as Editor;

it('backspace should select the image element', () => {
  const editor = pipe(
    input,
    withReact,
    withSelectOnBackspace({ allow: [ELEMENT_IMAGE] })
  );
  const [foundBefore] = Editor.nodes(editor, {
    match: (node) => node.type === ELEMENT_IMAGE,
    at: editor.selection?.anchor,
  });
  expect(foundBefore).toBeFalsy();
  editor.deleteBackward('character');
  const [found] = Editor.nodes(editor, {
    match: (node) => node.type === ELEMENT_IMAGE,
    at: editor.selection?.anchor,
  });
  expect(found).toBeTruthy();
});
