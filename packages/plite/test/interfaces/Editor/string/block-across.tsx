import { string as editorString } from '@platejs/plite/internal';
/** @jsx jsx  */

export const input = (
  <editor>
    <block>
      <text>one</text>
      <text>two</text>
    </block>
    <block>
      <text>three</text>
      <text>four</text>
    </block>
  </editor>
);
export const test = (editor) => editorString(editor, []);
export const output = 'onetwothreefour';
