import { jsx } from '../../..';
/** @jsx jsx */
import { hasBlocks as editorHasBlocks } from '../../../../src/internal';
import { getChildren as editorGetChildren } from '../../../../src/testing';

jsx;

export const input = (
  <editor>
    <block>
      one<inline>two</inline>three
    </block>
  </editor>
);
export const test = (editor) => {
  const block = editorGetChildren(editor)[0];
  return editorHasBlocks(editor, block);
};
export const output = false;
