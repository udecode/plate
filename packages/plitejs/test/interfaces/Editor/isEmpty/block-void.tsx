import { jsx } from '../../..';
/** @jsx jsx */
import { isEmpty as editorIsEmpty } from '../../../../src/internal';
import { getChildren as editorGetChildren } from '../../../../src/testing';

jsx;

export const input = (
  <editor>
    <block void>
      <text />
    </block>
  </editor>
);
export const test = (editor) => {
  const block = editorGetChildren(editor)[0];
  return editorIsEmpty(editor, block);
};
export const output = false;
