import {
  getSnapshot as editorGetSnapshot,
  isEnd as editorIsEnd,
} from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <cursor />
      one
    </block>
  </editor>
);
export const test = (editor) => {
  const { anchor } = editorGetSnapshot(editor).selection;
  return editorIsEnd(editor, anchor, [0]);
};
export const output = false;
