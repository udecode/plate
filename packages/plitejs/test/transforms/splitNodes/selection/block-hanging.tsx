/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.split();
};
export const input = (
  <editor>
    <block>one</block>
    <block>
      <anchor />
      two
    </block>
    <block>
      <focus />
      three
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>one</block>
    <block>
      <text />
    </block>
    <block>
      <cursor />
      three
    </block>
  </editor>
);
