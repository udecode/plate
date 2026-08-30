import { edges as editorEdges } from '../../../../src/internal';
/** @jsx jsx */

export const input = (
  <editor>
    <block>one</block>
  </editor>
);

export const test = (editor) =>
  editorEdges(editor, {
    kind: 'text',
    anchor: { path: [0, 0], offset: 1 },
    focus: { path: [0, 0], offset: 3 },
  });

export const output = [
  { path: [0, 0], offset: 1 },
  { path: [0, 0], offset: 3 },
];
