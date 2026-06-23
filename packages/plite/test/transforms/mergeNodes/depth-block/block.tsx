import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { ElementApi } from '@platejs/plite';

export const input = (
  <editor>
    <block>one</block>
    <block>
      <cursor />
      two
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.merge({
    match: (n) => ElementApi.isElement(n) && Editor.isBlock(editor, n),
  });
};
export const output = (
  <editor>
    <block>
      one
      <cursor />
      two
    </block>
  </editor>
);
