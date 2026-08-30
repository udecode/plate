import { jsx } from '../../../..';
/** @jsx jsx */
import { positions as editorPositions } from '../../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) =>
  Array.from(editorPositions(editor, { at: [1, 0] }));
export const output = [
  { path: [1, 0], offset: 0 },
  { path: [1, 0], offset: 1 },
  { path: [1, 0], offset: 2 },
  { path: [1, 0], offset: 3 },
];
