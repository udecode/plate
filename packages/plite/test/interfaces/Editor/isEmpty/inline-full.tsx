import {
  getChildren as editorGetChildren,
  isEmpty as editorIsEmpty,
} from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      one<inline>two</inline>three
    </block>
  </editor>
);
export const test = (editor) => {
  const inline = editorGetChildren(editor)[0].children[1];
  return editorIsEmpty(editor, inline);
};
export const output = false;
