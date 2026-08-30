import { jsx } from '../../..';
/** @jsx jsx */
import {
  getChildren as editorGetChildren,
  hasBlocks as editorHasBlocks,
} from '../../../../src/internal';

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
  return editorHasBlocks(editor, block);
};
export const output = true;
