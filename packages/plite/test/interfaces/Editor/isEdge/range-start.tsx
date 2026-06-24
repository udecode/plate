import { isEdge as editorIsEdge } from '@platejs/plite/internal';
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

  return editorIsEdge(editor, point, {
    anchor: point,
    focus: { path: [0, 0], offset: 3 },
  });
};
export const output = true;
