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
  editor.nodes.remove({ at: [0] });
};
export const output = (
  <editor>
    <block>two</block>
  </editor>
);
