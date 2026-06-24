/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.split({ at: [0, 1, 0] });
};
export const input = (
  <editor>
    <block>
      <text />
      <inline void>
        <text>word</text>
      </inline>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text />
      <inline void>
        <text>word</text>
      </inline>
      <text />
    </block>
  </editor>
);
