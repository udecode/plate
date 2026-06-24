import { positions as editorPositions } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../../..';

jsx;

export const input = (
  <editor>
    <block>
      1<inline>2</inline>3
    </block>
  </editor>
);
export const test = (editor) => Array.from(editorPositions(editor, { at: [] }));

export const output = [
  { path: [0, 0], offset: 0 },
  { path: [0, 0], offset: 1 },
  { path: [0, 1, 0], offset: 0 },
  { path: [0, 1, 0], offset: 1 },
  { path: [0, 2], offset: 0 },
  { path: [0, 2], offset: 1 },
];
