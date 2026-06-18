/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <text />
      <inline>
        <cursor />
        one
      </inline>
      <text />
      <inline>two</inline>
      <text />
    </block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.move({ at: [0, 1], to: [0, 3] });
};
export const output = (
  <editor>
    <block>
      <text />
      <inline>two</inline>
      <text />
      <inline>
        <cursor />
        one
      </inline>
      <text />
    </block>
  </editor>
);
