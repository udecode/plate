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
      t<anchor />
      wo<inline>three</inline>fou
      <focus />r
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>one</block>
    <block>
      t<cursor />r
    </block>
  </editor>
);
