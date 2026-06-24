/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      one
      <cursor />
    </block>
  </editor>
);
export const run = (editor, options = {}) => {
  editor.nodes.insert(
    <block void>
      <text>two</text>
    </block>,
    { at: [1], select: true, ...options }
  );
};
export const output = (
  <editor>
    <block>one</block>
    <block void>
      two
      <cursor />
    </block>
  </editor>
);
