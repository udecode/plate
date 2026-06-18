import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);

export const test = (editor) => Editor.after(editor, [0, 0]);

export const output = { path: [1, 0], offset: 0 };
