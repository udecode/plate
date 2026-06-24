/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.fragment.insert(
    <fragment>
      <block>one</block>
      <text>two</text>
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
    <block>
      two
      <cursor />
      word
    </block>
  </editor>
);
