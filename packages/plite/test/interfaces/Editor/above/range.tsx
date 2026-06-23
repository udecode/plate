import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { ElementApi } from '@platejs/plite';

export const input = (
  <editor>
    <block>
      <block>
        <block>one</block>
      </block>
      <block>two</block>
    </block>
  </editor>
);
const range = {
  anchor: { offset: 0, path: [0, 0, 0, 0] },
  focus: { offset: 0, path: [0, 1, 0] },
};
export const test = (editor) =>
  Editor.above(editor, {
    at: range,
    match: (n) => ElementApi.isElement(n) && Editor.isBlock(editor, n),
  });
export const output = [
  <block>
    <block>
      <block>one</block>
    </block>
    <block>two</block>
  </block>,
  [0],
];
