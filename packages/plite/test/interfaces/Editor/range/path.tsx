import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) => Editor.range(editor, [0]);
export const output = {
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 3 },
};
