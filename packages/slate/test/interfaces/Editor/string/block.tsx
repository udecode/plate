import { Editor } from '@platejs/slate/internal';
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
export const test = (editor) => Editor.string(editor, [0]);
export const output = 'onetwo';
