/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.split();
};
export const input = (
  <editor>
    <block>
      <text />
      <inline void>
        word
        <cursor />
      </inline>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text />
      <inline void>word</inline>
      <text />
    </block>
    <block>
      <cursor />
    </block>
  </editor>
);
