import { above as editorAbove } from '@platejs/plite/internal';
/** @jsx jsx */

export const input = (
  <editor>
    <block>
      <block>one</block>
    </block>
  </editor>
);

export const test = (editor) =>
  editorAbove(editor, { at: { path: [0, 0, 0], offset: 1 } });

export const output = [<block>one</block>, [0, 0]];
