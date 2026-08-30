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
  Array.from(editorPositions(editor, { at: [], unit: 'block' }));
export const output = [
  { path: [0, 0], offset: 0 },
  { path: [0, 0], offset: 13 },
  { path: [1, 0], offset: 0 },
  { path: [1, 0], offset: 13 },
];
