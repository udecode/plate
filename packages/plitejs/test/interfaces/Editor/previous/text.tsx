import { TextApi } from 'plitejs';

import { jsx } from '../../..';
/** @jsx jsx */
import { previous as editorPrevious } from '../../../../src/internal';

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
