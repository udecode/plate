/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block>
      <anchor />
      one
    </block>
    <block>
      <focus />
      two
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <cursor />
    </block>
    <block>two</block>
  </editor>
);
