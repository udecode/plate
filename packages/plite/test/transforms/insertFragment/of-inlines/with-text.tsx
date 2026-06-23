/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.fragment.insert(
    <fragment>
      one
      <inline>two</inline>
      three
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
    <block>
      woone
      <inline>two</inline>
      three
      <cursor />
      rd
    </block>
  </editor>
);
