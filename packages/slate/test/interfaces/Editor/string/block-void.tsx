import { Editor } from '@platejs/slate/internal';
/** @jsx jsx  */

export const input = (
  <editor>
    <block void>
      <text>one</text>
      <text>two</text>
    </block>
  </editor>
);
export const test = (editor) => Editor.string(editor, [0]);
export const output = '';
