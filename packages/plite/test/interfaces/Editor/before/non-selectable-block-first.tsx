import { before as editorBefore } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block nonSelectable>two</block>
    <block>three</block>
  </editor>
);

export const test = (editor) =>
  editorBefore(editor, { path: [1, 0], offset: 0 });

export const output = undefined;
