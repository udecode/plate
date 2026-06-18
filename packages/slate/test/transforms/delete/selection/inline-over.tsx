/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor) => {
  editor.text.delete();
};
export const input = (
  <editor>
    <block>
      o<anchor />
      ne<inline>two</inline>thre
      <focus />e
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      o<cursor />e
    </block>
  </editor>
);
