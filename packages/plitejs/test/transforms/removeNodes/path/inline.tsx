/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <text />
      <inline>one</inline>
      <text />
      <inline>two</inline>
      <text />
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.remove({ at: [0, 1] });
};
export const output = (
  <editor>
    <block>
      <text />
      <inline>two</inline>
      <text />
    </block>
  </editor>
);
