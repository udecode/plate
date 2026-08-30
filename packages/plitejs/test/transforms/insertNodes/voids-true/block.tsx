/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block void>
      one
      <cursor />
    </block>
  </editor>
);
export const run = (editor, options = {}) => {
  editor.nodes.insert(<text>two</text>, {
    at: [0, 1],
    voids: true,
    options,
  });
};
export const output = (
  <editor>
    <block void>
      one
      <cursor />
      two
    </block>
  </editor>
);
