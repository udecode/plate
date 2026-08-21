import { ElementApi } from '@platejs/plite';
/** @jsx jsx */
import { isBlock as editorIsBlock } from '@platejs/plite/internal';

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.split({
    match: (n) => ElementApi.isElement(n) && editorIsBlock(editor, n),
    always: true,
  });
};
export const input = (
  <editor>
    <block>
      word
      <cursor />
    </block>
    <block>another</block>
  </editor>
);
export const output = (
  <editor>
    <block>word</block>
    <block>
      <cursor />
    </block>
    <block>another</block>
  </editor>
);
