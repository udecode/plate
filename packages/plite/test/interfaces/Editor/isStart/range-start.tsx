import { isStart as editorIsStart } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) => {
  const point = { path: [0, 0], offset: 2 };

  return editorIsStart(editor, point, {
    anchor: point,
    focus: { path: [0, 0], offset: 3 },
  });
};
export const output = true;
