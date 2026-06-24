/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.fragment.insert(
    <fragment>
      <block>one</block>
      <block>two</block>
    </fragment>,
    options
  );
};
export const input = (
  <editor>
    <block>
      wo
      <cursor />
      rd
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>woone</block>
    <block>
      two
      <cursor />
      rd
    </block>
  </editor>
);
