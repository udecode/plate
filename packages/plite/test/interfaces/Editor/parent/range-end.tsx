import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) =>
  Editor.parent(
    editor,
    {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [1, 0], offset: 2 },
    },
    { edge: 'end' }
  );
export const output = [<block>two</block>, [1]];
