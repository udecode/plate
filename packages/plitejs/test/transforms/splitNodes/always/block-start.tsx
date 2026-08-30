import { ElementApi } from 'plitejs';

import { jsx } from '../../..';
/** @jsx jsx */
import { isBlock as editorIsBlock } from '../../../../src/internal';

jsx;

export const run = (editor) => {
  editor.nodes.split({
    match: (n) => ElementApi.isElement(n) && editorIsBlock(editor, n),
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
