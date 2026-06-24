import { parent as editorParent } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const test = (editor) => editorParent(editor, [0, 0]);
export const output = [<block>one</block>, [0]];
