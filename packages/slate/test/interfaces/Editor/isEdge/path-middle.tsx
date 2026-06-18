import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      on
      <cursor />e
    </block>
  </editor>
);
export const test = (editor) => {
  const { anchor } = Editor.getSnapshot(editor).selection;
  return Editor.isEdge(editor, anchor, [0]);
};
export const output = false;
