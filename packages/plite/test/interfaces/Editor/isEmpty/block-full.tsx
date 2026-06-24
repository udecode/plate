import {
  getChildren as editorGetChildren,
  isEmpty as editorIsEmpty,
} from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) => {
  const block = editorGetChildren(editor)[0];
  return editorIsEmpty(editor, block);
};
export const output = false;
