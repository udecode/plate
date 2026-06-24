import { after as editorAfter } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);

export const test = (editor) => editorAfter(editor, [1, 0]);

export const output = undefined;
