import {
  getChildren as editorGetChildren,
  isInline as editorIsInline,
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
  return editorIsInline(editor, block);
};
export const output = false;
