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
  editor.nodes.merge({
    at: [1],
    withMatch: ([, p]) => p.length === 1,
  });
};
export const output = (
  <editor>
    <block>
      <block>one</block>
      <block>two</block>
    </block>
  </editor>
);
