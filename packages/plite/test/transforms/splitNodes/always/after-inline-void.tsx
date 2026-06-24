import { isBlock as editorIsBlock } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { ElementApi } from '@platejs/plite';

export const run = (editor) => {
  editor.nodes.split({
    match: (n) => ElementApi.isElement(n) && editorIsBlock(editor, n),
    always: true,
  });
};
export const input = (
  <editor>
    <block>
      one
      <inline void>
        <text />
      </inline>
      <cursor />
      two
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one
      <inline void>
        <text />
      </inline>
      <text />
    </block>
    <block>
      <cursor />
      two
    </block>
  </editor>
);
