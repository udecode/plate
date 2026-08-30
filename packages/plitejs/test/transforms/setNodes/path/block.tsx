/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>word</block>
  </editor>
);
export const run = (editor) => {
  editor.nodes.set({ key: 'a' }, { at: [0] });
};
export const output = (
  <editor>
    <block key="a">word</block>
  </editor>
);
