import { jsx } from '../../..';
/** @jsx jsx */
import { after as editorAfter } from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);

export const test = (editor) =>
  editorAfter(editor, { path: [0, 0], offset: 1 });

export const output = { path: [0, 0], offset: 2 };
