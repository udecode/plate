import { jsx } from '../../..';
/** @jsx jsx */
import { isStart as editorIsStart } from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) => {
  const point = { path: [0, 0], offset: 2 };

  return editorIsStart(editor, point, point);
};
export const output = true;
