import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { TextApi } from '@platejs/plite';

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) =>
  Editor.previous(editor, { at: [1], match: TextApi.isText });
export const output = [<text>one</text>, [0, 0]];
