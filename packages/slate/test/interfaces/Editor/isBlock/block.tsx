import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { ElementApi } from '@platejs/slate';

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) => {
  const block = Editor.getChildren(editor)[0];
  return ElementApi.isElement(block) && Editor.isBlock(editor, block);
};
export const output = true;
