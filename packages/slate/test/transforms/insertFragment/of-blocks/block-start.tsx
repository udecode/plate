/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.fragment.insert(
    <fragment>
      <block>one</block>
      <block>two</block>
      <block>three</block>
    </fragment>,
    options
  );
};
export const input = (
  <editor>
    <block>
      <cursor />
      word
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>one</block>
    <block>two</block>
    <block>
      three
      <cursor />
      word
    </block>
  </editor>
);
