/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <block>one</block>
    </block>
    <block>
      <block>two</block>
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.remove({ at: [0, 0] });
};
export const output = (
  <editor>
    <block>
      <text />
    </block>
    <block>
      <block>two</block>
    </block>
  </editor>
);
