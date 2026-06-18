/** @jsx jsx */

import { jsx } from '../../..';

jsx;

export const run = (editor, options = {}) => {
  editor.fragment.insert(<fragment>fragment</fragment>, {
    voids: true,
    ...options,
  });
};
export const input = (
  <editor>
    <block>
      <text />
      <inline void>
        wo
        <cursor />
        rd
      </inline>
      <text />
    </block>
  </editor>
);
// Current policy: with voids enabled, text fragments split the void inline and
// land at the surrounding block text level.
export const output = (
  <editor>
    <block>
      <text />
      <inline void>wo</inline>
      fragment
      <cursor />
      <inline void>rd</inline>
      <text />
    </block>
  </editor>
);
