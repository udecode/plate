import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { ElementApi } from '@platejs/plite';

export const input = (
  <editor>
    <block>
      <block>one</block>
    </block>
  </editor>
);
export const test = (editor) =>
  Editor.above(editor, {
    at: [0, 0, 0],
    match: (n) => ElementApi.isElement(n) && Editor.isBlock(editor, n),
    mode: 'highest',
  });
export const output = [
  <block>
    <block>one</block>
  </block>,
  [0],
];
