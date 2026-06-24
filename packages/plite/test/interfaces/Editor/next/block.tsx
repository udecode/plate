import {
  isBlock as editorIsBlock,
  next as editorNext,
} from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { ElementApi } from '@platejs/plite';

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) =>
  editorNext(editor, {
    at: [0],
    match: (n) => ElementApi.isElement(n) && editorIsBlock(editor, n),
  });
export const output = [<block>two</block>, [1]];
