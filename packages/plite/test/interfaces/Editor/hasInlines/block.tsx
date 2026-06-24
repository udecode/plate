import {
  getChildren as editorGetChildren,
  hasInlines as editorHasInlines,
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
  return editorHasInlines(editor, block);
};
export const output = true;
