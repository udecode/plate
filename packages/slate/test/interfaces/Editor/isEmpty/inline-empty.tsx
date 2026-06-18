import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      one
      <inline />
      three
    </block>
  </editor>
);
export const test = (editor) => {
  const inline = Editor.getChildren(editor)[0].children[1];
  return Editor.isEmpty(editor, inline);
};
export const output = true;
