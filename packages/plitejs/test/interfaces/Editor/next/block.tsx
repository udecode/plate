import { ElementApi } from 'plitejs';

import { jsx } from '../../..';
/** @jsx jsx */
import {
  isBlock as editorIsBlock,
  next as editorNext,
} from '../../../../src/internal';

jsx;

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
