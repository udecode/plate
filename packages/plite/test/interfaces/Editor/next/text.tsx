import { TextApi } from '@platejs/plite';
/** @jsx jsx */
import { next as editorNext } from '@platejs/plite/internal';

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) =>
  editorNext(editor, { at: [0], match: TextApi.isText });
export const output = [<text>two</text>, [1, 0]];
