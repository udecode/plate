import {
  getChildren as editorGetChildren,
  isBlock as editorIsBlock,
} from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { ElementApi } from '@platejs/plite';

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) => {
  const block = editorGetChildren(editor)[0];
  return ElementApi.isElement(block) && editorIsBlock(editor, block);
};
export const output = true;
