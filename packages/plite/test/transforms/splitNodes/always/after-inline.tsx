import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { ElementApi } from '@platejs/plite';

export const run = (editor) => {
  editor.nodes.split({
    match: (n) => ElementApi.isElement(n) && Editor.isBlock(editor, n),
    always: true,
  });
};
export const input = (
  <editor>
    <block>
      word
      <inline>hyperlink</inline>
      <cursor />
      word
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      word
      <inline>hyperlink</inline>
      <text />
    </block>
    <block>
      <cursor />
      word
    </block>
  </editor>
);
