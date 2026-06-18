/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block>
      one
      <inline>
        two
        <cursor />
      </inline>
      <text />
    </block>
    <block>
      <text />
      <inline>three</inline>
      four
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one
      <inline>two</inline>
      <text>
        <cursor />
      </text>
      <inline>three</inline>
      four
    </block>
  </editor>
);
