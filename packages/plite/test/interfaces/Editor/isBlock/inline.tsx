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
    <block>
      one<inline>two</inline>three
    </block>
  </editor>
);
export const test = (editor) => {
  const inline = editorGetChildren(editor)[0].children[1];
  return ElementApi.isElement(inline) && editorIsBlock(editor, inline);
};
export const output = false;
