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
      one<inline>two</inline>three
    </block>
  </editor>
);
export const test = (editor) => {
  const block = editorGetChildren(editor)[0];
  return editorHasBlocks(editor, block);
};
export const output = false;
