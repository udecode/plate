/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.insert('a');
};
export const input = (
  <editor>
    <block>
      <anchor />
      one
    </block>
    <block>two</block>
    <block>
      <focus />
      three
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      a<cursor />
    </block>
    <block>three</block>
  </editor>
);
