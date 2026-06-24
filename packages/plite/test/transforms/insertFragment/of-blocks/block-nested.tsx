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
      <block>
        word
        <cursor />
      </block>
    </block>
  </editor>
);
export const output = (
  <editor>
    <block>
      <block>wordone</block>
      <block>two</block>
      <block>
        three
        <cursor />
      </block>
    </block>
  </editor>
);
