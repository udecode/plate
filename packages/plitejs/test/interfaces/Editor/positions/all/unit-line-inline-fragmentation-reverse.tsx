import { jsx } from '../../../..';
/** @jsx jsx */
import { positions as editorPositions } from '../../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>
      he<inline>ll</inline>o wo<inline>rl</inline>d
    </block>
  </editor>
);
export const test = (editor) =>
  Array.from(editorPositions(editor, { at: [], unit: 'line', reverse: true }));

export const output = [
  { path: [0, 4], offset: 1 },
  { path: [0, 0], offset: 0 },
];
