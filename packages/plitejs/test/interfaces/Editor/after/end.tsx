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

export const test = (editor) => editorAfter(editor, [1, 0]);

export const output = undefined;
