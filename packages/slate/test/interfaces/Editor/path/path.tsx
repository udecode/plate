import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) => Editor.path(editor, [0]);
export const output = [0];
