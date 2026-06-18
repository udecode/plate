/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.split();
};
export const input = (
  <editor>
    <block>
      wo
      <anchor />
      rd
    </block>
    <block>
      an
      <focus />
      other
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>wo</block>
    <block>
      <cursor />
      other
    </block>
  </editor>
);
