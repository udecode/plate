/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.lift({ at: [0, 0] });
};
export const input = (
  <editor>
    <block>
      <block>word</block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>word</block>
  </editor>
);
