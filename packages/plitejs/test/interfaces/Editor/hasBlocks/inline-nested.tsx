import { jsx } from '../../..';
/** @jsx jsx */
import { hasBlocks as editorHasBlocks } from '../../../../src/internal';
import { getChildren as editorGetChildren } from '../../../../src/testing';

jsx;

export const input = (
  <editor>
    <block>
      one
      <inline>
        two<inline>three</inline>four
      </inline>
      five
    </block>
  </editor>
);
export const test = (editor) => {
  const inline = editorGetChildren(editor)[0].children[1];
  return editorHasBlocks(editor, inline);
};
export const output = false;
