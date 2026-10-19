import { jsx } from '../../..';
/** @jsx jsx */
import { isEnd as editorIsEnd } from '../../../../src/internal';
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
  return editorIsEnd(editor, anchor, [0]);
};
export const output = true;
