import { Editor } from '@platejs/plite/internal';
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
  Editor.previous(editor, {
    at: [1],
    match: (n) => ElementApi.isElement(n) && Editor.isBlock(editor, n),
  });
export const output = [<block>one</block>, [0]];
