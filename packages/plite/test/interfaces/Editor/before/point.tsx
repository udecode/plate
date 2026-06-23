import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);

export const test = (editor) =>
  Editor.before(editor, { path: [0, 0], offset: 1 });

export const output = { path: [0, 0], offset: 0 };
