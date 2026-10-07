import { jsx } from '../../..';
/** @jsx jsx */
import { isEdge as editorIsEdge } from '../../../../src/internal';
import { getSnapshot as editorGetSnapshot } from '../../../../src/testing';

jsx;

export const input = (
  <editor>
    <block>
      one
      <cursor />
    </block>
  </editor>
);
export const test = (editor) => {
  const { anchor } = editorGetSnapshot(editor).selection;
  return editorIsEdge(editor, anchor, [0]);
};
export const output = true;
