import { jsx } from '../../..';
/** @jsx jsx */
import { path as editorPath } from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) => editorPath(editor, [0]);
export const output = [0];
