import { jsx } from '../../..';
/** @jsx jsx */
import { next as editorNext } from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) => editorNext(editor, { at: [0] });
export const output = [<block>two</block>, [1]];
