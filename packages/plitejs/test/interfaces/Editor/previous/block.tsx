import { ElementApi } from 'plitejs';

import { jsx } from '../../..';
/** @jsx jsx */
import { previous as editorPrevious } from '../../../../src/internal';
import { isBlock as editorIsBlock } from '../../../../src/testing';

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
