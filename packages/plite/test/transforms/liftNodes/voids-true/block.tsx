/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.lift({ at: [0, 0], voids: true });
};
export const input = (
  <editor>
    <block void>
      <block>word</block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>word</block>
  </editor>
);
