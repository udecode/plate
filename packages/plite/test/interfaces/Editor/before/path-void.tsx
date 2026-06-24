import { before as editorBefore } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block void>one</block>
    <block void>two</block>
  </editor>
);

export const test = (editor) => editorBefore(editor, [1, 0], { voids: true });

export const output = { path: [0, 0], offset: 3 };
