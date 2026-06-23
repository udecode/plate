/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <text>bar</text>
      <text>foo</text>
    </block>
    <block>
      <cursor />
      baz
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.move({ at: [0, 0], to: [1, 0] });
};
export const output = (
  <editor>
    <block>
      <text>foo</text>
    </block>
    <block>
      <text>
        bar
        <cursor />
        baz
      </text>
    </block>
  </editor>
);
