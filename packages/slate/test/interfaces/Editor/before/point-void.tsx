import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block void>one</block>
  </editor>
);

export const test = (editor) =>
  Editor.before(editor, { path: [0, 0], offset: 1 }, { voids: true });

export const output = { path: [0, 0], offset: 0 };
