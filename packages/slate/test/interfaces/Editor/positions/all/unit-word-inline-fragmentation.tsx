import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../../..';

jsx;

export const input = (
  <editor>
    <block>
      he<inline>ll</inline>o wo<inline>rl</inline>d
    </block>
  </editor>
);
export const test = (editor) =>
  Array.from(Editor.positions(editor, { at: [], unit: 'word' }));

export const output = [
  { path: [0, 0], offset: 0 },
  { path: [0, 2], offset: 1 },
  { path: [0, 4], offset: 1 },
];
