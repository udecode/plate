import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) =>
  Array.from(Editor.positions(editor, { reverse: true, at: [0, 0] }));
export const output = [
  { path: [0, 0], offset: 3 },
  { path: [0, 0], offset: 2 },
  { path: [0, 0], offset: 1 },
  { path: [0, 0], offset: 0 },
];
