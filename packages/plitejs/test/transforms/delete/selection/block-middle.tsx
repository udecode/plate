/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block>one</block>
    <block>
      t<anchor />w<focus />o
    </block>
    <block>three</block>
  </editor>
);
export const output = (
  <editor>
    <block>one</block>
    <block>
      t<cursor />o
    </block>
    <block>three</block>
  </editor>
);
