import { after as editorAfter } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block nonSelectable>two</block>
    <block>three</block>
  </editor>
);

export const test = (editor) =>
  editorAfter(editor, { path: [0, 0], offset: 3 });

export const output = { path: [2, 0], offset: 0 };
