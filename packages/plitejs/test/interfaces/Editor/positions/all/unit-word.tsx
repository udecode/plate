import { jsx } from '../../../..';
/** @jsx jsx */
import { positions as editorPositions } from '../../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one two three</block>
    <block>four five six</block>
  </editor>
);
export const test = (editor) =>
  Array.from(editorPositions(editor, { at: [], unit: 'word' }));
export const output = [
  { path: [0, 0], offset: 0 },
  { path: [0, 0], offset: 3 },
  { path: [0, 0], offset: 7 },
  { path: [0, 0], offset: 13 },
  { path: [1, 0], offset: 0 },
  { path: [1, 0], offset: 4 },
  { path: [1, 0], offset: 9 },
  { path: [1, 0], offset: 13 },
];
