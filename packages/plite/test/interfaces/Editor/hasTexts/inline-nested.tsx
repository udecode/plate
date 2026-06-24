import {
  getChildren as editorGetChildren,
  hasTexts as editorHasTexts,
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
  return editorHasTexts(editor, inline);
};
export const output = false;
