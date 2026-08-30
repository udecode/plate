import { ElementApi } from 'plitejs';

import { jsx } from '../../..';
/** @jsx jsx */
import { isBlock as editorIsBlock } from '../../../../src/internal';

jsx;

export const run = (editor) => {
  editor.nodes.split({
    match: (n) => ElementApi.isElement(n) && editorIsBlock(editor, n),
  });
};
export const input = (
  <editor>
    <block>
      wo
      <cursor />
      rd
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>wo</block>
    <block>
      <cursor />
      rd
    </block>
  </editor>
);
