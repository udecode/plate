/** @jsx jsx */

import { jsx } from '../../..';

jsx;

const fragment = (
  <fragment>
    <block>one</block>
    <block>two</block>
  </fragment>
);
export const run = (editor, options = {}) => {
  editor.fragment.insert(fragment, options);
};
export const input = (
  <editor>
    <block>
      <anchor />
      word
    </block>
    <block>
      <focus />
      another
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>one</block>
    <block>
      two
      <cursor />
    </block>
    <block>another</block>
  </editor>
);
