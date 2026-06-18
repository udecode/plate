/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const input = (
  <editor>
    <block>word</block>
  </editor>
);
export const run = (editor) => {
  editor.text.insert('x', { at: [0] });
};
export const output = (
  <editor>
    <block>x</block>
  </editor>
);
