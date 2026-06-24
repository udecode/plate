import { string as editorString } from '@platejs/plite/internal';
/** @jsx jsx  */

export const input = (
  <editor>
    <block>
      <text>one</text>
      <text>two</text>
    </block>
  </editor>
);
export const test = (editor) => editorString(editor, [0, 0]);
export const output = 'one';
