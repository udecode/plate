import { point as editorPoint } from '@platejs/plite/internal';
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
  editorPoint(
    editor,
    {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 1], offset: 2 },
    },
    { edge: 'start' }
  );
export const output = { path: [0, 0], offset: 1 };
