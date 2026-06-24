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
    <block void>
      <text />
    </block>
    <block>
      <focus />
      one
    </block>
    <block>two</block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <cursor />
      one
    </block>
    <block>two</block>
  </editor>
);
