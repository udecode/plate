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
      <inline void>
        wo
        <cursor />
        rd
      </inline>
      <text />
    </block>
  </editor>
);
// Current policy: insertion inside a void inline is ignored unless voids are
// explicitly enabled.
export const output = (
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
