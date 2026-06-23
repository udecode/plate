/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.fragment.insert(<fragment>fragment</fragment>, options);
};
export const input = (
  <editor>
    <block>
      <text />
      <inline>
        <cursor />
      </inline>
      <text />
    </block>
  </editor>
);
// Current policy: text fragments inserted inside empty inline text land at the
// surrounding block text level.
export const output = (
  <editor>
    <block>
      <text />
      <inline>
        <text />
      </inline>
      fragment
      <cursor />
    </block>
  </editor>
);
