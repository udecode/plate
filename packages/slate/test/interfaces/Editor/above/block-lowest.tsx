import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { ElementApi } from '@platejs/slate';

export const input = (
  <editor>
    <block>
      <block>one </block>
    </block>
  </editor>
);

export const test = (editor) =>
  Editor.above(editor, {
    at: [0, 0, 0],
    match: (n) => ElementApi.isElement(n) && Editor.isBlock(editor, n),
    mode: 'lowest',
  });

export const output = [<block>one </block>, [0, 0]];
