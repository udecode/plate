/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.merge({ at: [1] });
};
export const output = (
  <editor>
    <block>onetwo</block>
  </editor>
);
