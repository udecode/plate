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
        wo
        <cursor />
        rd
      </inline>
      <text />
    </block>
  </editor>
);
// Current policy: text fragments inserted inside inline text split the inline
// and land at the surrounding block text level.
export const output = (
  <editor>
    <block>
      <text />
      <inline>wo</inline>
      fragment
      <cursor />
      <inline>rd</inline>
      <text />
    </block>
  </editor>
);
