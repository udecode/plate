/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.set({ key: 'a' }, { at: [0, 0] });
};
export const input = (
  <editor>
    <block>word</block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text key="a">word</text>
    </block>
  </editor>
);
