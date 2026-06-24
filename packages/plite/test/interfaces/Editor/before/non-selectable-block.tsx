import { before as editorBefore } from '@platejs/plite/internal';
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
  editorBefore(editor, { path: [2, 0], offset: 0 });

export const output = { path: [0, 0], offset: 3 };
