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
