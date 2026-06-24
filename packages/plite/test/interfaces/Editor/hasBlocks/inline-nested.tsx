import {
  getChildren as editorGetChildren,
  hasBlocks as editorHasBlocks,
} from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

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
