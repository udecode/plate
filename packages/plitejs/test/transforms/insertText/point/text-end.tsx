/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>
      <text>word</text>
    </block>
  </editor>
);
export const run = (editor) => {
  editor.text.insert('x', { at: { path: [0, 0], offset: 4 } });
};
export const output = (
  <editor>
    <block>wordx</block>
  </editor>
);
