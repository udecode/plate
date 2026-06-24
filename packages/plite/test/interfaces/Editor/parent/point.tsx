import { parent as editorParent } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) =>
  editorParent(editor, { path: [0, 0], offset: 1 });
export const output = [<block>one</block>, [0]];
