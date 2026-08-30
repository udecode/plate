import { ElementApi } from 'plitejs';

import { jsx } from '../../..';
/** @jsx jsx */
import {
  isBlock as editorIsBlock,
  previous as editorPrevious,
} from '../../../../src/internal';

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
