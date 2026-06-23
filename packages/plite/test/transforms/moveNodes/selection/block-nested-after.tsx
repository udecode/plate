import { Editor } from '@platejs/plite/internal';
/** @jsx jsx */

import { jsx } from '../../..';

jsx;

import { ElementApi } from '@platejs/plite';

export const run = (editor) => {
  editor.nodes.move({
    match: (n) => ElementApi.isElement(n) && Editor.isBlock(editor, n),
    to: [1],
  });
};
export const input = (
  <editor>
    <block>
      <block>one</block>
      <block>
        <anchor />
        two
      </block>
      <block>
        three
        <focus />
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block>one</block>
    </block>
    <block>
      <anchor />
      two
    </block>
    <block>
      three
      <focus />
    </block>
  </editor>
);
