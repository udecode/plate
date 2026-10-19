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
      <block>
        <anchor />
        three
      </block>
      <block>
        <focus />
        four
      </block>
      <block>five</block>
      <block>six</block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>one</block>
    <block>two</block>
    <block>
      <anchor />
      three
    </block>
    <block>
      <focus />
      four
    </block>
    <block>five</block>
    <block>six</block>
  </editor>
);
