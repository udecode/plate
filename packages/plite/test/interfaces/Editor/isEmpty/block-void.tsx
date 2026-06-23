import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block void>
      <text />
    </block>
  </editor>
);
export const test = (editor) => {
  const block = Editor.getChildren(editor)[0];
  return Editor.isEmpty(editor, block);
};
export const output = false;
