import { Editor } from '@platejs/slate/internal';
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
  Editor.point(
    editor,
    {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 1], offset: 2 },
    },
    { edge: 'end' }
  );
export const output = { path: [0, 1], offset: 2 };
