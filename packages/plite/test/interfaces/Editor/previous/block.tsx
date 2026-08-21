import { ElementApi } from '@platejs/plite';
/** @jsx jsx */
import {
  isBlock as editorIsBlock,
  previous as editorPrevious,
} from '@platejs/plite/internal';

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) =>
  editorPrevious(editor, {
    at: [1],
    match: (n) => ElementApi.isElement(n) && editorIsBlock(editor, n),
  });
export const output = [<block>one</block>, [0]];
