import { previous as editorPrevious } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) => editorPrevious(editor, { at: [1] });
export const output = [<block>one</block>, [0]];
