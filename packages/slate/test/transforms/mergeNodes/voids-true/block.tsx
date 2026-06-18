/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block void>
      <text>one</text>
      <text>two</text>
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.merge({ at: [0, 1], voids: true });
};
export const output = (
  <editor>
    <block void>onetwo</block>
  </editor>
);
