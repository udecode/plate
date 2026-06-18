/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block void>
      <anchor />
    </block>
    <block>one</block>
    <block>
      tw
      <focus />o
    </block>
    <block>three</block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <cursor />o
    </block>
    <block>three</block>
  </editor>
);
