import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      one<inline void>two</inline>three
    </block>
  </editor>
);
export const test = (editor) => {
  const inline = Editor.getChildren(editor)[0].children[1];
  return Editor.isVoid(editor, inline);
};
export const output = true;
