import { Editor } from '@platejs/plite/internal';
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

  return Editor.isEdge(editor, point, {
    anchor: point,
    focus: { path: [0, 0], offset: 3 },
  });
};
export const output = true;
