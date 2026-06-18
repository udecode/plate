import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <cursor />
      one
    </block>
  </editor>
);
export const test = (editor) => {
  const { anchor } = Editor.getSnapshot(editor).selection;
  return Editor.isStart(editor, anchor, [0]);
};
export const output = true;
