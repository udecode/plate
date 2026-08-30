import { jsx } from '../../..';
/** @jsx jsx */
import { isEdge as editorIsEdge } from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) => {
  const point = { path: [0, 0], offset: 2 };

  return editorIsEdge(editor, point, {
    kind: 'text',
    anchor: point,
    focus: { path: [0, 0], offset: 3 },
  });
};
export const output = true;
