import { jsx } from '../../../..';
/** @jsx jsx */
import { positions as editorPositions } from '../../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>
      1<inline>2</inline>3
    </block>
  </editor>
);
export const test = (editor) =>
  Array.from(editorPositions(editor, { at: [], unit: 'character' }));

export const output = [
  { path: [0, 0], offset: 0 },
  { path: [0, 0], offset: 1 },
  { path: [0, 1, 0], offset: 1 },
  { path: [0, 2], offset: 1 },
];
