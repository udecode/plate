import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { ElementApi } from '@platejs/slate';

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) =>
  Editor.next(editor, {
    at: [0],
    match: (n) => ElementApi.isElement(n) && Editor.isBlock(editor, n),
  });
export const output = [<block>two</block>, [1]];
