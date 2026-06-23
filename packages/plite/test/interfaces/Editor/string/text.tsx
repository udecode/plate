import { Editor } from '@platejs/plite/internal';
/** @jsx jsx  */

export const input = (
  <editor>
    <block>
      <text>one</text>
      <text>two</text>
    </block>
  </editor>
);
export const test = (editor) => Editor.string(editor, [0, 0]);
export const output = 'one';
