/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.unwrap({ match: (n) => n.a, split: true });
};
export const input = (
  <editor>
    <block a>
      <block>
        <anchor />
        one
      </block>
      <block>
        two
        <focus />
      </block>
      <block>three</block>
      <block>four</block>
      <block>five</block>
      <block>six</block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <anchor />
      one
    </block>
    <block>
      two
      <focus />
    </block>
    <block a>
      <block>three</block>
      <block>four</block>
      <block>five</block>
      <block>six</block>
    </block>
  </editor>
);
