import { edges as editorEdges } from '@platejs/plite/internal';
/** @jsx jsx */

export const input = (
  <editor>
    <block>one</block>
  </editor>
);

export const test = (editor) => editorEdges(editor, [0]);

export const output = [
  { path: [0, 0], offset: 0 },
  { path: [0, 0], offset: 3 },
];
