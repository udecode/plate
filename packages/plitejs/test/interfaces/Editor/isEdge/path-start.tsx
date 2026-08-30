import { jsx } from '../../..';
/** @jsx jsx */
import {
  getSnapshot as editorGetSnapshot,
  isEdge as editorIsEdge,
} from '../../../../src/internal';

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
  return editorIsEdge(editor, anchor, [0]);
};
export const output = true;
