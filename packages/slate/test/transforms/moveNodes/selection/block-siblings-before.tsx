import { Editor } from '@platejs/slate/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { ElementApi } from '@platejs/slate';

export const run = (editor) => {
  editor.nodes.move({
    match: (n) => ElementApi.isElement(n) && Editor.isBlock(editor, n),
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
