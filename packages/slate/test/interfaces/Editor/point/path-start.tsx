import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) => Editor.point(editor, [0], { edge: 'start' });
export const output = { path: [0, 0], offset: 0 };
