/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.lift({ at: [0, 1] });
};
export const input = (
  <editor>
    <block>
      <block>one</block>
      <block>two</block>
      <block>three</block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block>one</block>
    </block>
    <block>two</block>
    <block>
      <block>three</block>
    </block>
  </editor>
);
