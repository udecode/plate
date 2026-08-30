/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <cursor />
      one
    </block>
    <block>
      <block>two</block>
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.move({ at: [0], to: [1, 1] });
};
export const output = (
  <editor>
    <block>
      <block>two</block>
      <block>
        <cursor />
        one
      </block>
    </block>
  </editor>
);
