import { jsx } from '../../..';
/** @jsx jsx */
import { previous as editorPrevious } from '../../../../src/internal';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) => editorPrevious(editor, { at: [1] });
export const output = [<block>one</block>, [0]];
