/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.unwrap({ match: (n) => n.a });
};
export const input = (
  <editor>
    <block a>
      <block>one</block>
      <block>two</block>
      <block>three</block>
      <block>four</block>
      <block>
        <anchor />
        five
      </block>
      <block>
        <focus />
        six
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>one</block>
    <block>two</block>
    <block>three</block>
    <block>four</block>
    <block>
      <anchor />
      five
    </block>
    <block>
      <focus />
      six
    </block>
  </editor>
);
