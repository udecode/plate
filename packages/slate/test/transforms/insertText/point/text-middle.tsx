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
  editor.text.insert('x', { at: { path: [0, 0], offset: 2 } });
};
export const output = (
  <editor>
    <block>woxrd</block>
  </editor>
);
