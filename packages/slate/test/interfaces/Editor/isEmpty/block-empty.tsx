import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block />
  </editor>
);
export const test = (editor) => {
  const block = Editor.getChildren(editor)[0];
  return Editor.isEmpty(editor, block);
};
export const output = true;
