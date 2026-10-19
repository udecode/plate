import { jsx } from '../../..';
/** @jsx jsx */
import { point as editorPoint } from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) => editorPoint(editor, [0], { edge: 'start' });
export const output = { path: [0, 0], offset: 0 };
