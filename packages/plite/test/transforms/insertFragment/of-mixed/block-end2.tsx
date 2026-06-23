/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.fragment.insert(
    <fragment>
      <text>one</text>
      <block>two</block>
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
    <block>
      two
      <cursor />
    </block>
  </editor>
);
