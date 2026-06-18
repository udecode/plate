import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { ElementApi } from '@platejs/slate';

export const run = (editor) => {
  editor.nodes.split({
    match: (n) => ElementApi.isElement(n) && Editor.isBlock(editor, n),
  });
};
export const input = (
  <editor>
    <block>
      <text>
        one
        <cursor />
      </text>
      <text>two</text>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one
      <cursor />
    </block>
    <block>two</block>
  </editor>
);
