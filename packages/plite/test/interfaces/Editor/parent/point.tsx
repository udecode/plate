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
  Editor.parent(editor, { path: [0, 0], offset: 1 });
export const output = [<block>one</block>, [0]];
