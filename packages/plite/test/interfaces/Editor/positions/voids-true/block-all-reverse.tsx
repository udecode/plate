import { positions as editorPositions } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../../..';

jsx;

export const input = (
  <editor>
    <block void>one</block>
  </editor>
);
export const test = (editor) =>
  Array.from(editorPositions(editor, { at: [], reverse: true, voids: true }));
export const output = [
  { path: [0, 0], offset: 3 },
  { path: [0, 0], offset: 2 },
  { path: [0, 0], offset: 1 },
  { path: [0, 0], offset: 0 },
];
