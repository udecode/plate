import { Editor } from '@platejs/plite/internal';
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
  Editor.path(editor, {
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [1, 0], offset: 2 },
  });
export const output = [];
