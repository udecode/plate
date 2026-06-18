import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { ElementApi } from '@platejs/slate';

export const input = (
  <editor>
    <block>
      one<inline>two</inline>three
    </block>
  </editor>
);
export const test = (editor) => {
  const inline = Editor.getChildren(editor)[0].children[1];
  return ElementApi.isElement(inline) && Editor.isBlock(editor, inline);
};
export const output = false;
