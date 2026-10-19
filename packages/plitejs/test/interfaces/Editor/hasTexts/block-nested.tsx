import { jsx } from '../../..';
/** @jsx jsx */
import { hasTexts as editorHasTexts } from '../../../../src/internal';
import { getChildren as editorGetChildren } from '../../../../src/testing';

jsx;

export const input = (
  <editor>
    <block>
      <block>one</block>
    </block>
  </editor>
);
export const test = (editor) => {
  const block = editorGetChildren(editor)[0];
  return editorHasTexts(editor, block);
};
export const output = false;
