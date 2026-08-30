import { jsx } from '../../../..';
/** @jsx jsx */
import { positions as editorPositions } from '../../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
    <block>three</block>
  </editor>
);
export const test = (editor) => Array.from(editorPositions(editor, { at: [] }));
export const output = [
  { path: [0, 0], offset: 0 },
  { path: [0, 0], offset: 1 },
  { path: [0, 0], offset: 2 },
  { path: [0, 0], offset: 3 },
  { path: [1, 0], offset: 0 },
  { path: [1, 0], offset: 1 },
  { path: [1, 0], offset: 2 },
  { path: [1, 0], offset: 3 },
  { path: [2, 0], offset: 0 },
  { path: [2, 0], offset: 1 },
  { path: [2, 0], offset: 2 },
  { path: [2, 0], offset: 3 },
  { path: [2, 0], offset: 4 },
  { path: [2, 0], offset: 5 },
];
