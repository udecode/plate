import { isBlock as editorIsBlock } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { ElementApi } from '@platejs/plite';

export const run = (editor) => {
  editor.nodes.set(
    { someKey: true },
    { match: (n) => ElementApi.isElement(n) && editorIsBlock(editor, n) }
  );
};
export const input = (
  <editor>
    <block void>
      <cursor />
      word
    </block>
  </editor>
);
export const output = (
  <editor>
    <block someKey void>
      <cursor />
      word
    </block>
  </editor>
);
