/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block void>
      <text>
        <cursor />
        one
      </text>
      <text>two</text>
    </block>
    <block>three</block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.remove({ at: [0] });
};
export const output = (
  <editor>
    <block>
      <cursor />
      three
    </block>
  </editor>
);
