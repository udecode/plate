/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.fragment.insert(
    <fragment>
      <text>one</text>
      <block>two</block>
      <text>three</text>
    </fragment>,
    options
  );
};
export const input = (
  <editor>
    <block>
      word
      <cursor />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>wordone</block>
    <block>two</block>
    <block>
      three
      <cursor />
    </block>
  </editor>
);
