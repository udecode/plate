/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
    <block>
      <anchor />
      two
    </block>
    <block>
      three
      <focus />
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.wrap(<block a />);
};
export const output = (
  <editor>
    <block>one</block>
    <block a>
      <block>
        <anchor />
        two
      </block>
      <block>
        three
        <focus />
      </block>
    </block>
  </editor>
);
