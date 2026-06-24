import { point as editorPoint } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) => editorPoint(editor, [0]);
export const output = { path: [0, 0], offset: 0 };
