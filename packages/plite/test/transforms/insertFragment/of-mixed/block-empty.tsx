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
    <block>word</block>
    <block>
      <cursor />
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>word</block>
    <block>one</block>
    <block>two</block>
    <block>
      three
      <cursor />
    </block>
  </editor>
);
