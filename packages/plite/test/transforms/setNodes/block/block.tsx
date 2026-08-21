import { ElementApi } from '@platejs/plite';
/** @jsx jsx */
import { isBlock as editorIsBlock } from '@platejs/plite/internal';

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.set(
    { someKey: true },
    { match: (n) => ElementApi.isElement(n) && editorIsBlock(editor, n) }
  );
};
export const input = (
  <editor>
    <block>
      <cursor />
      word
    </block>
  </editor>
);
export const output = (
  <editor>
    <block someKey>
      <cursor />
      word
    </block>
  </editor>
);
