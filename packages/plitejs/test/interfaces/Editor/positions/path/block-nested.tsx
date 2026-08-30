import { jsx } from '../../../..';
/** @jsx jsx */
import { positions as editorPositions } from '../../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>
      <block>one</block>
      <block>two</block>
    </block>
  </editor>
);
export const test = (editor) =>
  Array.from(editorPositions(editor, { at: [0] }));
export const output = [
  { path: [0, 0, 0], offset: 0 },
  { path: [0, 0, 0], offset: 1 },
  { path: [0, 0, 0], offset: 2 },
  { path: [0, 0, 0], offset: 3 },
  { path: [0, 1, 0], offset: 0 },
  { path: [0, 1, 0], offset: 1 },
  { path: [0, 1, 0], offset: 2 },
  { path: [0, 1, 0], offset: 3 },
];
