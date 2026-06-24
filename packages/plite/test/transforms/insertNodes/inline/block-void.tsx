/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.nodes.insert(
    <inline void>
      <text />
    </inline>,
    options
  );
};
export const input = (
  <editor>
    <block void>
      <cursor />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block void>
      <cursor />
    </block>
  </editor>
);
