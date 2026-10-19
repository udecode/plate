/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.nodes.set({ key: 'a' }, { at: [0, 1] });
};
export const input = (
  <editor>
    <block>
      <text />
      <inline>word</inline>
      <text />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <text />
      <inline key="a">word</inline>
      <text />
    </block>
  </editor>
);
