import {
  getSnapshot as editorGetSnapshot,
  isStart as editorIsStart,
} from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      on
      <cursor />e
    </block>
  </editor>
);
export const test = (editor) => {
  const { anchor } = editorGetSnapshot(editor).selection;
  return editorIsStart(editor, anchor, [0]);
};
export const output = false;
