/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block>
      one<inline>two</inline>
      <anchor />a<focus />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      one<inline>two</inline>
      <text>
        <cursor />
      </text>
    </block>
  </editor>
);
