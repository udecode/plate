import { jsx } from '../../..';
/** @jsx jsx */
import { hasInlines as editorHasInlines } from '../../../../src/internal';
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
  return editorHasInlines(editor, block);
};
export const output = false;
