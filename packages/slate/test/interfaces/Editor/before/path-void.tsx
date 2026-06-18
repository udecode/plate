import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block void>one</block>
    <block void>two</block>
  </editor>
);

export const test = (editor) => Editor.before(editor, [1, 0], { voids: true });

export const output = { path: [0, 0], offset: 3 };
