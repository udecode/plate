/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>one</block>
  </editor>
);
export const run = (editor, options = {}) => {
  editor.nodes.insert(<block>two</block>, options);
};
export const output = (
  <editor>
    <block>one</block>
    <block>
      two
      <cursor />
    </block>
  </editor>
);
