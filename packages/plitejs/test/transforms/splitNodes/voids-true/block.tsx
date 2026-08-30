/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.split({ at: [0, 1], voids: true });
};
export const input = (
  <editor>
    <block void>
      <block>one</block>
      <block>two</block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block void>
      <block>one</block>
    </block>
    <block void>
      <block>two</block>
    </block>
  </editor>
);
