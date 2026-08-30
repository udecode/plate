import { jsx } from '../../..';
/** @jsx jsx */
import { after as editorAfter } from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);

export const test = (editor) => editorAfter(editor, [0, 0]);

export const output = { path: [1, 0], offset: 0 };
