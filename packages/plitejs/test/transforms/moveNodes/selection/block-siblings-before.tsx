import { ElementApi } from 'plitejs';

import { jsx } from '../../..';
/** @jsx jsx */
import { isBlock as editorIsBlock } from '../../../../src/internal';

jsx;

export const run = (editor) => {
  editor.nodes.move({
    match: (n) => ElementApi.isElement(n) && editorIsBlock(editor, n),
    to: [0],
  });
};
export const input = (
  <editor>
    <block>one</block>
    <block>
      two
      <anchor />
    </block>
    <block>
      three
      <focus />
    </block>
  </editor>
);

export const output = (
  <editor>
    <block>
      two
      <anchor />
    </block>
    <block>
      three
      <focus />
    </block>
    <block>one</block>
  </editor>
);
