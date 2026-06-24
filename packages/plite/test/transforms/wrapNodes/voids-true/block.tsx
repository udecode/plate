/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.wrap(<block a />, { at: [0, 0], voids: true });
};
export const input = (
  <editor>
    <block void>word</block>
  </editor>
);
export const output = (
  <editor>
    <block void>
      <block a>word</block>
    </block>
  </editor>
);
