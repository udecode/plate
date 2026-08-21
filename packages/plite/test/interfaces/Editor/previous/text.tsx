import { TextApi } from '@platejs/plite';
/** @jsx jsx */
import { previous as editorPrevious } from '@platejs/plite/internal';

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const test = (editor) =>
  editorPrevious(editor, { at: [1], match: TextApi.isText });
export const output = [<text>one</text>, [0, 0]];
