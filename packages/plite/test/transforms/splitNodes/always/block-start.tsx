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
    <block>word</block>
    <block>
      <cursor />
      another
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>word</block>
    <block>
      <text />
    </block>
    <block>
      <cursor />
      another
    </block>
  </editor>
);
