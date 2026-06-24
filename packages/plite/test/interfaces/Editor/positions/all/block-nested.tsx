import { positions as editorPositions } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../../..';

jsx;

export const input = (
  <editor>
    <block>
      <block>one</block>
    </block>
    <block>
      <block>two</block>
    </block>
  </editor>
);
export const test = (editor) => Array.from(editorPositions(editor, { at: [] }));
export const output = [
  { path: [0, 0, 0], offset: 0 },
  { path: [0, 0, 0], offset: 1 },
  { path: [0, 0, 0], offset: 2 },
  { path: [0, 0, 0], offset: 3 },
  { path: [1, 0, 0], offset: 0 },
  { path: [1, 0, 0], offset: 1 },
  { path: [1, 0, 0], offset: 2 },
  { path: [1, 0, 0], offset: 3 },
];
