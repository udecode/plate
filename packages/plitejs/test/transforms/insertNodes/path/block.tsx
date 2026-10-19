/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <cursor />
      one
    </block>
  </editor>
);
export const run = (editor, options = {}) => {
  editor.nodes.insert(
    <block>
      <text />
    </block>,
    { at: [0], ...options }
  );
};
export const output = (
  <editor>
    <block>
      <text />
    </block>
    <block>
      <cursor />
      one
    </block>
  </editor>
);
