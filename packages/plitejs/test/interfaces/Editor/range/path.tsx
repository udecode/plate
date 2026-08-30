import { jsx } from '../../..';
/** @jsx jsx */
import { range as editorRange } from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) => editorRange(editor, [0]);
export const output = {
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 3 },
};
