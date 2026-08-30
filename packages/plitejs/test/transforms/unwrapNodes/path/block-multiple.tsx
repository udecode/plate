/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.unwrap({ at: [0] });
};
export const input = (
  <editor>
    <block>
      <block>one</block>
      <block>two</block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>one</block>
    <block>two</block>
  </editor>
);
