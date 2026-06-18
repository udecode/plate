import { Editor } from '@platejs/slate/internal';
/** @jsx jsx  */

export const input = (
  <editor>
    <block>
      one<inline>two</inline>three
    </block>
  </editor>
);
export const test = (editor) => Editor.string(editor, [0, 1]);
export const output = 'two';
