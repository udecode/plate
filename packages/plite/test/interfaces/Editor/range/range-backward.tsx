import { range as editorRange } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) =>
  editorRange(editor, {
    anchor: { path: [0, 0], offset: 2 },
    focus: { path: [0, 0], offset: 1 },
  });
export const output = {
  anchor: { path: [0, 0], offset: 2 },
  focus: { path: [0, 0], offset: 1 },
};
