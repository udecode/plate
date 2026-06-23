import { Editor } from '@platejs/plite/internal';
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
  const inline = Editor.getChildren(editor)[0].children[1];
  return Editor.hasBlocks(editor, inline);
};
export const output = false;
