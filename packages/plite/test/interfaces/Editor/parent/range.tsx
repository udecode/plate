import { parent as editorParent } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) =>
  editorParent(editor, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 2 },
  });
export const output = [<block>one</block>, [0]];
