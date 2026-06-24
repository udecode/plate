/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.unwrap({ match: (n) => n.a });
};
export const input = (
  <editor>
    <block>
      <text />
      <inline a>
        <anchor />
        one
      </inline>
      two
      <inline a>
        three
        <focus />
      </inline>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <anchor />
      onetwothree
      <focus />
    </block>
  </editor>
);
