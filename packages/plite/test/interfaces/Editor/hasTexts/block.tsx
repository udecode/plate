import {
  getChildren as editorGetChildren,
  hasTexts as editorHasTexts,
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
  return editorHasTexts(editor, block);
};
export const output = true;
