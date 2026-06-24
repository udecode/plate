import { string as editorString } from '@platejs/plite/internal';
/** @jsx jsx  */

export const input = (
  <editor>
    <block void>
      <text>one</text>
      <text>two</text>
    </block>
  </editor>
);
export const test = (editor) => editorString(editor, [0], { voids: true });
export const output = 'onetwo';
