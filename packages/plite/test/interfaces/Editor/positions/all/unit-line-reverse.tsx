import { positions as editorPositions } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../../..';

jsx;

export const input = (
  <editor>
    <block>one two three</block>
    <block>four five six</block>
  </editor>
);
export const test = (editor) =>
  Array.from(editorPositions(editor, { at: [], unit: 'line', reverse: true }));
export const output = [
  { path: [1, 0], offset: 13 },
  { path: [1, 0], offset: 0 },
  { path: [0, 0], offset: 13 },
  { path: [0, 0], offset: 0 },
];
