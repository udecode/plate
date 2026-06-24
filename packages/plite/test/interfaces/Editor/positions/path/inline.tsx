import { positions as editorPositions } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../../..';

jsx;

export const input = (
  <editor>
    <block>
      one<inline>two</inline>three
    </block>
  </editor>
);
export const test = (editor) =>
  Array.from(editorPositions(editor, { at: [0, 1] }));
export const output = [
  { path: [0, 1, 0], offset: 0 },
  { path: [0, 1, 0], offset: 1 },
  { path: [0, 1, 0], offset: 2 },
  { path: [0, 1, 0], offset: 3 },
];
