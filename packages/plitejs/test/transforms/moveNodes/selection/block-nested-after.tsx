import { ElementApi } from 'plitejs';

import { jsx } from '../../..';
/** @jsx jsx */
import { isBlock as editorIsBlock } from '../../../../src/internal';

jsx;

export const run = (editor) => {
  editor.nodes.move({
    match: (n) => ElementApi.isElement(n) && editorIsBlock(editor, n),
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
