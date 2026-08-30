/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <cursor />
    </block>
    <block>not empty</block>
  </editor>
);
export const run = (editor, options = {}) => {
  editor.nodes.insert(
    <block>
      <text />
    </block>,
    options
  );
};
export const output = (
  <editor>
    <block>
      <text />
    </block>
    <block>
      <cursor />
    </block>
    <block>not empty</block>
  </editor>
);
