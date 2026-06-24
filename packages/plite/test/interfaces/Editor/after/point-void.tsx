import { after as editorAfter } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block void>one</block>
  </editor>
);

export const test = (editor) =>
  editorAfter(editor, { path: [0, 0], offset: 1 }, { voids: true });

export const output = { path: [0, 0], offset: 2 };
