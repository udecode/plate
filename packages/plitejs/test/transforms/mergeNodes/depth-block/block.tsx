import { ElementApi } from 'plitejs';

import { jsx } from '../../..';
/** @jsx jsx */
import { isBlock as editorIsBlock } from '../../../../src/internal';

jsx;

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
    match: (n) => ElementApi.isElement(n) && editorIsBlock(editor, n),
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
